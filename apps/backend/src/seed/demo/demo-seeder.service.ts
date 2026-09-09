import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { DEMO_CUSTOMERS, DEMO_PRODUCTS, DEMO_USERS, DEMO_DEAL_STAGES } from "./demo-data";

export class DemoSeederService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async seedDemoData() {
    console.log("🎭 Starting demo data seeding...");

    // 1. Create demo users
    console.log("👥 Creating demo users...");
    for (const user of DEMO_USERS) {
      const existing = await this.prisma.user.findUnique({ where: { email: user.email } });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await this.prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            password: hashedPassword,
            role: user.role as any,
          },
        });
        console.log(`  ✓ User: ${user.email} (${user.role})`);
      }
    }

    // 2. Create demo customers
    console.log("🏢 Creating demo customers...");
    const customerIds: string[] = [];
    for (const cust of DEMO_CUSTOMERS) {
      const created = await this.prisma.customer.create({
        data: {
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          company: cust.company,
          status: cust.status as any,
        },
      });
      customerIds.push(created.id);
    }
    console.log(`  ✓ ${customerIds.length} customers created`);

    // 3. Create demo products
    console.log("📦 Creating demo products...");
    const productIds: string[] = [];
    for (const prod of DEMO_PRODUCTS) {
      const created = await this.prisma.product.create({
        data: {
          name: prod.name,
          sku: prod.sku,
          category: prod.category,
          price: prod.price,
          stock: prod.stock,
          minStock: prod.minStock,
        },
      });
      productIds.push(created.id);
    }
    console.log(`  ✓ ${productIds.length} products created`);

    // 4. Create demo deals
    console.log("💼 Creating demo deals...");
    let dealsCount = 0;
    for (let i = 0; i < 30; i++) {
      const randomCust = customerIds[Math.floor(Math.random() * customerIds.length)];
      const stage = DEMO_DEAL_STAGES[Math.floor(Math.random() * DEMO_DEAL_STAGES.length)];
      await this.prisma.deal.create({
        data: {
          title: `قرارداد فروش - ${["محصولات لبنی", "مواد غذایی", "لوازم بهداشتی", "نوشیدنی"][Math.floor(Math.random() * 4)]} ${i + 1}`,
          amount: Math.floor(Math.random() * 500000000) + 10000000,
          stage: stage as any,
          customerId: randomCust,
        },
      });
      dealsCount++;
    }
    console.log(`  ✓ ${dealsCount} deals created`);

    // 5. Create demo movements
    console.log("📊 Creating demo stock movements...");
    let movCount = 0;
    for (let i = 0; i < 200; i++) {
      const randomProd = productIds[Math.floor(Math.random() * productIds.length)];
      const type = Math.random() > 0.5 ? "IN" : "OUT";
      await this.prisma.movement.create({
        data: {
          type: type as any,
          quantity: Math.floor(Math.random() * 50) + 1,
          notes: type === "IN" ? "ورود از تأمین‌کننده" : "فروش به مشتری",
          productId: randomProd,
        },
      });
      movCount++;
    }
    console.log(`  ✓ ${movCount} movements created`);

    console.log("\n🎉 Demo data seeding completed!");
    return {
      users: DEMO_USERS.length,
      customers: customerIds.length,
      products: productIds.length,
      deals: dealsCount,
      movements: movCount,
    };
  }

  async clearDemoData() {
    console.log("🧹 Clearing demo data...");
    // Delete in correct order (respecting foreign keys)
    await this.prisma.movement.deleteMany({});
    await this.prisma.deal.deleteMany({});
    await this.prisma.customer.deleteMany({});
    await this.prisma.product.deleteMany({});
    // Keep admin user but remove demo users
    for (const user of DEMO_USERS) {
      await this.prisma.user.deleteMany({ where: { email: user.email } });
    }
    console.log("✓ Demo data cleared");
  }
}
