import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Controller()
export class TestController {
  @Get()
  root() {
    return {
      status: 'ok',
      service: 'blueframe-backend',
      database_url_set: !!process.env.DATABASE_URL
    };
  }

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
      
      const existing = await prisma.user.findFirst({ where: { role: 'admin' } });
      if (existing) {
        return { success: true, message: 'Admin already exists', email: existing.email };
      }

      const hashedPassword = await bcrypt.hash('admin123456', 10);
      await prisma.user.create({
        data: {
          email: 'admin@blueframe.com',
          name: 'Admin',
          password: hashedPassword,
          role: 'admin',
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
}
