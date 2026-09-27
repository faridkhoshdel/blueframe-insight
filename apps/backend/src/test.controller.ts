import { Public } from './common/decorators/public.decorator';
import { DemoSeederService } from './seed/demo/demo-seeder.service';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Controller, Get } from '@nestjs/common';
const prisma = new PrismaClient();

@Controller()
export class TestController {
  @Public()
  @Get()
  root() {
    return {
      status: 'ok',
      service: 'blueframe-backend',
      database_url_set: !!process.env.DATABASE_URL
    };
  }

  @Public()
  @Get('test-db')
  async testDb() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'connected', database: 'ok' };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Get('create-admin')
  async createAdminGet() {
    try {
      if (!process.env.DATABASE_URL) {
        return { success: false, error: 'DATABASE_URL not set' };
      }
      
      const existing = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
      if (existing) {
        return { success: true, message: 'Admin already exists', email: existing.email };
      }

      const hashedPassword = await bcrypt.hash('admin123456', 10);
      await prisma.user.create({
        data: {
          email: 'admin@blueframe.com',
          name: 'Admin',
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });

      return { 
        success: true, 
        credentials: { email: 'admin@blueframe.com', password: 'admin123456' },
        message: 'Admin created successfully!'
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  @Get('demo/seed')
  async seedDemo() {
    if (process.env.DEMO_MODE !== 'true') {
      return { error: 'Demo seeding only available in demo mode' };
    }
    try {
      const seeder = new DemoSeederService();
      const result = await seeder.seedDemoData();
      return { success: true, message: 'Demo data seeded', stats: result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  @Get('demo/clear')
  async clearDemo() {
    if (process.env.DEMO_MODE !== 'true') {
      return { error: 'Demo clear only available in demo mode' };
    }
    try {
      const seeder = new DemoSeederService();
      await seeder.clearDemoData();
      return { success: true, message: 'Demo data cleared' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  @Get('demo/info')
  async demoInfo() {
    return {
      demoMode: process.env.DEMO_MODE === 'true',
      message: process.env.DEMO_MODE === 'true'
        ? '🎭 This is a demo instance - All data is synthetic and resets every 24 hours'
        : 'Production instance',
      features: {
        watermark: process.env.DEMO_MODE === 'true',
        readOnly: process.env.DEMO_MODE === 'true',
        aiAlgorithmsHidden: process.env.DEMO_MODE === 'true',
      },
    };
  }
}