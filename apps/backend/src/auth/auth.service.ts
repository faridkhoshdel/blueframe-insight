import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
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
        role: 'ADMIN' as any,
        isActive: true,
      },
    });
    return { message: '✅ کاربر admin ساخته شد', email: 'admin@blueframe.ir', password: 'admin123' };
  }
}
