import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CrmService {
  async createCustomer(data: { name: string; email?: string; phone?: string; company?: string }) {
    return prisma.customer.create({ data });
  }

  async getAllCustomers() {
    return prisma.customer.findMany({
      include: { deals: { select: { id: true, value: true, stage: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDeal(data: { title: string; customerId: string; value: number; stage?: string }) {
    return prisma.deal.create({
      data: {
        title: data.title,
        customerId: data.customerId,
        value: data.value,
        stage: data.stage || 'LEAD',
      },
      include: { customer: true },
    });
  }

  async getAllDeals() {
    return prisma.deal.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDealsByStage() {
    const deals = await this.getAllDeals();
    const stages = ['LEAD', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    const grouped: Record<string, any[]> = {};
    
    stages.forEach(stage => {
      grouped[stage] = deals.filter(d => d.stage === stage);
    });
    
    return grouped;
  }

  async moveDealStage(dealId: string, newStage: string) {
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('معامله یافت نشد');
    
    return prisma.deal.update({
      where: { id: dealId },
      data: { stage: newStage, updatedAt: new Date() },
    });
  }

  async getPipelineStats() {
    const deals = await prisma.deal.findMany();
    const won = deals.filter(d => d.stage === 'WON');
    const totalValue = won.reduce((sum, d) => sum + d.value, 0);
    const activeDeals = deals.filter(d => !['WON', 'LOST'].includes(d.stage));
    const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    
    return {
      totalCustomers: await prisma.customer.count(),
      totalDeals: deals.length,
      wonDeals: won.length,
      totalWonValue: totalValue,
      activeDeals: activeDeals.length,
      pipelineValue,
      winRate: deals.length > 0 ? (won.length / deals.length * 100).toFixed(1) : 0,
    };
  }

  async getCustomerActivities(customerId: string) {
    return prisma.activity.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getAllActivities() {
    return prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { customer: { select: { name: true, company: true } } },
    });
  }
}
