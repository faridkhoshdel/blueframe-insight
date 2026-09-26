import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(email: string, password: string, name: string, role: string = 'SALES') {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('ایمیل قبلاً ثبت شده است');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        role: role as any,
        isActive: true 
      },
    });

    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    if (!user.isActive) throw new UnauthorizedException('حساب شما غیرفعال شده است');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, lastLoginAt: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('کاربر یافت نشد');
    return user;
  }

  async validateUser(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async seedAdmin() {
    const existing = await prisma.user.findUnique({ where: { email: 'admin@blueframe.ir' } });
    if (existing) return { message: 'Admin قبلاً ساخته شده' };

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@blueframe.ir',
        password: hashedPassword,
        name: 'مدیر سیستم',
        role: Role.ADMIN,
        isActive: true,
      },
    });
    return { message: '✅ کاربر admin ساخته شد', email: 'admin@blueframe.ir', password: 'admin123' };
  }


  async seedDemoUser() {
    const existing = await prisma.user.findUnique({ where: { email: 'demo@blueframe.ir' } });
    if (existing) {
      // به‌روزرسانی role به ADMIN (اگر String قدیمی است)
      await prisma.user.update({
        where: { email: 'demo@blueframe.ir' },
        data: { role: Role.ADMIN },
      });
      return { message: '✅ Demo user به‌روزرسانی شد', email: 'demo@blueframe.ir', role: 'ADMIN' };
    }

    const hashedPassword = await bcrypt.hash('Demo@123', 10);
    await prisma.user.create({
      data: {
        email: 'demo@blueframe.ir',
        password: hashedPassword,
        name: 'Demo User',
        role: Role.ADMIN,
        isActive: true,
      },
    });
    return { message: '✅ Demo user ساخته شد', email: 'demo@blueframe.ir', password: 'Demo@123', role: 'ADMIN' };
  }

  async seedAllRoles() {
    const users = [
      { email: 'warehouse@blueframe.ir', name: 'انباردار', role: Role.WAREHOUSE_MANAGER, password: 'Wh@123' },
      { email: 'distributor@blueframe.ir', name: 'مدیر پخش', role: Role.DISTRIBUTOR_MANAGER, password: 'Dm@123' },
      { email: 'driver@blueframe.ir', name: 'راننده', role: Role.DRIVER, password: 'Dr@123' },
      { email: 'sales@blueframe.ir', name: 'مدیر فروش', role: Role.SALES_MANAGER, password: 'Sm@123' },
      { email: 'executive@blueframe.ir', name: 'مدیرعامل', role: Role.EXECUTIVE, password: 'Ex@123' },
      { email: 'ai@blueframe.ir', name: 'اپراتور AI', role: Role.AI_OPERATOR, password: 'Ai@123' },
    ];

    const results: any[] = [];
    for (const u of users) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (existing) {
        await prisma.user.update({ where: { email: u.email }, data: { role: u.role } });
        results.push({ email: u.email, role: u.role, status: 'updated' });
      } else {
        const hash = await bcrypt.hash(u.password, 10);
        await prisma.user.create({
          data: { email: u.email, name: u.name, password: hash, role: u.role, isActive: true },
        });
        results.push({ email: u.email, role: u.role, status: 'created' });
      }
    }
    return { message: '✅ همه نقش‌ها seed شدند', users: results };
  }

}
