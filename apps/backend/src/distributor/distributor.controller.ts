import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('distributors')
@UseGuards(JwtAuthGuard)
export class DistributorController {
  private prisma = new PrismaClient();

  @Get()
  findAll() { return this.prisma.distributor.findMany({ include: { routes: true }, orderBy: { name: 'asc' } }); }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.distributor.findUnique({ where: { id }, include: { routes: true, invoices: true } });
  }

  @Post()
  create(@Body() data: { name: string; company?: string; phone: string; email?: string; address?: string; territory?: string }) {
    return this.prisma.distributor.create({ data });
  }
}
