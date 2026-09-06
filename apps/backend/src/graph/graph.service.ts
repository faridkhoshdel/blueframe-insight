import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GraphNode {
  id: string;
  name: string;
  company: string;
  leadScore: number;
  churnRisk: number;
  loyaltyStatus: string;
  degree: number;
  centrality: number;
  community: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  strength: number;
}

@Injectable()
export class GraphService {
  async buildGraph() {
    const customers = await prisma.customer.findMany({
      include: { sourceRelations: true, targetRelations: true }
    });
    const relationships = await prisma.relationship.findMany();

    const degreeMap = new Map<string, number>();
    customers.forEach(c => {
      degreeMap.set(c.id, c.sourceRelations.length + c.targetRelations.length);
    });

    const centralityMap = this.calculateBetweenness(customers, relationships);
    const communityMap = this.detectCommunities(customers, relationships);

    const nodes: GraphNode[] = customers.map(c => ({
      id: c.id, name: c.name, company: c.company || c.name,
      leadScore: c.leadScore, churnRisk: c.churnRisk,
      loyaltyStatus: c.loyaltyStatus,
      degree: degreeMap.get(c.id) || 0,
      centrality: centralityMap.get(c.id) || 0,
      community: communityMap.get(c.id) || 0,
    }));

    const edges: GraphEdge[] = relationships.map(r => ({
      source: r.sourceId, target: r.targetId,
      type: r.type, strength: r.strength,
    }));

    return { nodes, edges };
  }

  private calculateBetweenness(customers: any[], relationships: any[]): Map<string, number> {
    const centrality = new Map<string, number>();
    customers.forEach(c => centrality.set(c.id, 0));

    const adj = new Map<string, string[]>();
    customers.forEach(c => adj.set(c.id, []));
    relationships.forEach(r => {
      adj.get(r.sourceId)?.push(r.targetId);
      adj.get(r.targetId)?.push(r.sourceId);
    });

    const ids = customers.map(c => c.id);
    for (const s of ids) {
      for (const t of ids) {
        if (s === t) continue;
        const paths = this.findShortestPaths(s, t, adj);
        const totalPaths = paths.allPaths.length;
        if (totalPaths === 0) continue;

        for (const v of ids) {
          if (v === s || v === t) continue;
          let count = 0;
          for (const path of paths.allPaths) {
            if (path.includes(v)) count++;
          }
          centrality.set(v, (centrality.get(v) || 0) + count / totalPaths);
        }
      }
    }

    const maxC = Math.max(...Array.from(centrality.values()), 1);
    centrality.forEach((val, key) => centrality.set(key, val / maxC));
    return centrality;
  }

  private findShortestPaths(s: string, t: string, adj: Map<string, string[]>): { allPaths: string[][] } {
    const queue: string[][] = [[s]];
    const allPaths: string[][] = [];
    let shortestLength = Infinity;

    while (queue.length > 0) {
      const path = queue.shift()!;
      const node = path[path.length - 1];

      if (path.length > shortestLength) break;

      if (node === t) {
        allPaths.push(path);
        shortestLength = path.length;
        continue;
      }

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!path.includes(neighbor)) {
          queue.push([...path, neighbor]);
        }
      }
    }

    return { allPaths };
  }

  private detectCommunities(customers: any[], relationships: any[]): Map<string, number> {
    const community = new Map<string, number>();
    customers.forEach((c, i) => community.set(c.id, i));

    const adj = new Map<string, string[]>();
    customers.forEach(c => adj.set(c.id, []));
    relationships.forEach(r => {
      adj.get(r.sourceId)?.push(r.targetId);
      adj.get(r.targetId)?.push(r.sourceId);
    });

    for (let iter = 0; iter < 10; iter++) {
      let changed = false;
      for (const c of customers) {
        const neighbors = adj.get(c.id) || [];
        if (neighbors.length === 0) continue;

        const labelCounts = new Map<number, number>();
        for (const n of neighbors) {
          const label = community.get(n) || 0;
          labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
        }

        let maxLabel = community.get(c.id) || 0;
        let maxCount = 0;
        labelCounts.forEach((count, label) => {
          if (count > maxCount) {
            maxCount = count;
            maxLabel = label;
          }
        });

        if (maxLabel !== community.get(c.id)) {
          community.set(c.id, maxLabel);
          changed = true;
        }
      }
      if (!changed) break;
    }

    return community;
  }

  async analyzeCustomerNetwork(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        sourceRelations: { include: { target: true } },
        targetRelations: { include: { source: true } }
      }
    });

    if (!customer) throw new Error('مشتری یافت نشد');

    const connections = [
      ...customer.sourceRelations.map(r => ({ ...r.target, relationType: r.type, direction: 'outgoing' })),
      ...customer.targetRelations.map(r => ({ ...r.source, relationType: r.type, direction: 'incoming' })),
    ];

    return {
      customer: {
        id: customer.id, name: customer.name,
        company: customer.company,
        leadScore: customer.leadScore, churnRisk: customer.churnRisk,
      },
      connections,
      networkInsights: this.generateNetworkInsights(connections, customer),
    };
  }

  private generateNetworkInsights(connections: any[], customer: any): string {
    if (connections.length === 0) {
      return `${customer.name} هنوز در شبکه ارتباطی ثبت نشده است.`;
    }

    const avgLeadScore = connections.reduce((s, c) => s + (c.leadScore || 0), 0) / connections.length;
    const highRisk = connections.filter((c: any) => c.churnRisk > 0.5).length;

    let insight = `${customer.name} با ${connections.length} مشتری در ارتباط است. `;
    if (avgLeadScore > 70) insight += `شبکه قوی با میانگین Lead Score ${avgLeadScore.toFixed(0)}. `;
    if (highRisk > 0) insight += `⚠️ ${highRisk} مشتری با ریسک بالا در شبکه. `;

    return insight;
  }
}
