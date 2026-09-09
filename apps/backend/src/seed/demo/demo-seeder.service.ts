import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { DEMO_CUSTOMERS, DEMO_PRODUCTS, DEMO_USERS, DEMO_DEAL_STAGES } from "./demo-data";

export class DemoSeederService {
  private prisma: PrismaClient;
  constructor() { this.prisma = new PrismaClient(); }

  async seedDemoData() {
    console.log("Starting demo seeding...");
    const stats = { users: 0, customers: 0, products: 0, deals: 0, movements: 0 };
    for (const user of DEMO_USERS) {
      const ex = await this.prisma.user.findUnique({ where: { email: user.email } });
      if (!ex) {
        try {
          await this.prisma.user.create({ data: {
            email: user.email, name: user.name,
            password: await bcrypt.hash(user.password, 10),
            role: user.role as any,
          }});
          stats.users++;
        } catch (e: any) { console.log("user err:", e.message); }
      }
    }
    const custIds: string[] = [];
    for (const c of DEMO_CUSTOMERS) {
      try {
        const created = await this.prisma.customer.create({ data: {
          name: c.name, email: c.email, phone: c.phone,
          company: c.company, status: c.status as any,
        }});
        custIds.push(created.id); stats.customers++;
      } catch (e: any) { console.error("ERR:", JSON.stringify({code: e.code, message: e.message, meta: e.meta}) || String(e)); }
    }
    const prodIds: string[] = [];
    for (const p of DEMO_PRODUCTS) {
      try {
        const created = await this.prisma.product.create({ data: {
          name: p.name, sku: p.sku, category: p.category,
          price: p.price, stock: p.stock, minStock: p.minStock,
        }});
        prodIds.push(created.id); stats.products++;
      } catch (e: any) { console.error("ERR:", JSON.stringify({code: e.code, message: e.message, meta: e.meta}) || String(e)); }
    }
    if (custIds.length > 0) {
      for (let i = 0; i < 30; i++) {
        try {
          await this.prisma.deal.create({ data: {
            title: "Deal demo " + (i + 1),
            value: Math.floor(Math.random() * 500000000) + 10000000,
            stage: DEMO_DEAL_STAGES[Math.floor(Math.random() * DEMO_DEAL_STAGES.length)],
            probability: Math.floor(Math.random() * 90) + 10,
            customerId: custIds[Math.floor(Math.random() * custIds.length)],
          }});
          stats.deals++;
        } catch (e: any) { console.error("ERR:", JSON.stringify({code: e.code, message: e.message, meta: e.meta}) || String(e)); }
      }
    }
    if (prodIds.length > 0) {
      for (let i = 0; i < 200; i++) {
        try {
          await (this.prisma as any).inventoryMovement.create({ data: {
            type: Math.random() > 0.5 ? "IN" : "OUT",
            quantity: Math.floor(Math.random() * 50) + 1,
            notes: "Demo movement",
            productId: prodIds[Math.floor(Math.random() * prodIds.length)],
          }});
          stats.movements++;
        } catch (e: any) { console.error("ERR:", JSON.stringify({code: e.code, message: e.message, meta: e.meta}) || String(e)); }
      }
    }
    console.log("Seeding done:", stats);
    return stats;
  }

  async clearDemoData() {
    const models = ['inventoryMovement','dealItem','deal','activity','feedback','customer','product','agentLog','mediaAnalysis'];
    for (const m of models) {
      try { await (this.prisma as any)[m].deleteMany({}); } catch (e) {}
    }
  }
}
