import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';

@Injectable()
export class CustomerAuthService {
  private prisma = new PrismaClient();
  constructor(private jwt: JwtService) {}

  async requestOtp(phoneOrNationalId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { OR: [{ phone: phoneOrNationalId }, { nationalId: phoneOrNationalId }] },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    await this.prisma.otpCode.deleteMany({ where: { phone: customer.phone, used: false } });
    const code = String(randomInt(100000, 999999));
    await this.prisma.otpCode.create({
      data: { phone: customer.phone, code, expiresAt: new Date(Date.now() + 300000) },
    });
    console.log('OTP for ' + customer.phone + ' : ' + code);
    if (process.env.DEMO_MODE === 'true') {
      return { success: true, message: 'OTP ready (demo)', demoCode: code };
    }
    return { success: true, message: 'OTP sent via SMS' };
  }

  async verifyOtp(phone: string, code: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, code, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new BadRequestException('Invalid code');
    if (otp.expiresAt < new Date()) throw new BadRequestException('Code expired');
    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
    const customer = await this.prisma.customer.findFirst({ where: { phone } });
    const accessToken = await this.jwt.signAsync({
      sub: customer.id, email: customer.email, role: 'CUSTOMER',
      name: customer.name, customerId: customer.id,
    });
    return { accessToken, customer: { id: customer.id, name: customer.name, phone: customer.phone } };
  }
}
