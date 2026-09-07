import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  async register(@Body() body: { email: string; password: string; name: string; role?: string }) {
    return this.authService.register(body.email, body.password, body.name, body.role as any || 'SALES');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ورود کاربر' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت پروفایل کاربر فعلی' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @Post('seed-admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ساخت کاربر admin پیش‌فرض' })
  async seedAdmin() {
    return this.authService.seedAdmin();
  }
}

// ===== ENDPOINTS کمکی برای تست =====

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const testPrisma = new PrismaClient();

@Controller()
export class TestController {
  @Get()
  root() {
    return {
      status: 'ok',
      service: 'blueframe-backend',
      timestamp: new Date().toISOString(),
      database_url_set: !!process.env.DATABASE_URL,
      database_url_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) : 'UNDEFINED'
    };
  }

  @Get('test-db')
  async testDb() {
    try {
      if (!process.env.DATABASE_URL) {
        return { error: 'DATABASE_URL not set' };
      }
      await testPrisma.$queryRaw`SELECT 1`;
      return { status: 'connected', database: 'ok' };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  @Post('make-admin')
  async makeAdmin() {
    try {
      if (!process.env.DATABASE_URL) {
        return { success: false, error: 'DATABASE_URL not set' };
      }
      
      const existing = await testPrisma.user.findFirst({ where: { role: 'admin' } });
      if (existing) {
        return { success: true, message: 'Admin already exists', email: existing.email };
      }

      const hashedPassword = await bcrypt.hash('admin123456', 10);
      await testPrisma.user.create({
        data: {
          email: 'admin@blueframe.com',
          name: 'Admin',
          password: hashedPassword,
          role: 'admin',
        },
      });

      return { 
        success: true, 
        credentials: { email: 'admin@blueframe.com', password: 'admin123456' }
      };
    } catch (e: any) {
      return { success: false, error: e.message, stack: e.stack?.split('\n').slice(0, 3) };
    }
  }
}
