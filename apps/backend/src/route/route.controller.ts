import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RouteController {
  private prisma = new PrismaClient();

  @Get()
  findAll() {
    return this.prisma.route.findMany({
      include: { distributor: true, stops: { include: { customer: true }, orderBy: { orderIndex: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.route.findUnique({
      where: { id },
      include: { distributor: true, stops: { include: { customer: true }, orderBy: { orderIndex: 'asc' } } },
    });
  }

  @Post()
  create(@Body() data: { name: string; code: string; distributorId: string; scheduledDate?: string; stops?: { customerId: string }[] }) {
    return this.prisma.route.create({
      data: {
        name: data.name,
        code: data.code,
        distributorId: data.distributorId,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        totalStops: data.stops?.length || 0,
        stops: data.stops ? {
          create: data.stops.map((s, i) => ({ customerId: s.customerId, orderIndex: i })),
        } : undefined,
      },
      include: { distributor: true, stops: { include: { customer: true } } },
    });
  }

  @Post(':id/stops')
  addStop(@Param('id') id: string, @Body() data: { customerId: string; notes?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.routeStop.count({ where: { routeId: id } });
      await tx.routeStop.create({ data: { routeId: id, customerId: data.customerId, orderIndex: count, notes: data.notes } });
      await tx.route.update({ where: { id }, data: { totalStops: count + 1 } });
      return this.findOne(id);
    });
  }
}
