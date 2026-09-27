import { PrismaClient, Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
@Controller('distributors')
@Roles(Role.DISTRIBUTOR_MANAGER, Role.ADMIN)
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
