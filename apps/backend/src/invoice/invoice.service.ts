import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class InvoiceService {
  private prisma = new PrismaClient();

  async create(issuerId: string, dto: CreateInvoiceDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const subtotal = dto.items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - (i.discount || 0)), 0);
    const tax = dto.tax || 0;
    const discount = dto.discount || 0;
    const total = subtotal + tax - discount;

    const invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: dto.customerId,
        issuerId,
        distributorId: dto.distributorId,
        routeId: dto.routeId,
        subtotal, tax, discount, total,
        notes: dto.notes,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: 'DRAFT',
        verifyToken: randomUUID(),
        items: {
          create: dto.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discount: i.discount || 0,
            total: i.quantity * i.unitPrice * (1 - (i.discount || 0)),
          })),
        },
      },
      include: { items: { include: { product: true } }, customer: true, issuer: true },
    });

    return invoice;
  }

  async findAll(filters: any = {}) {
    return this.prisma.invoice.findMany({
      where: filters,
      include: { customer: true, issuer: true, distributor: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, issuer: true, distributor: true, route: true, items: { include: { product: true } }, feedbacks: true },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async findByToken(token: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { verifyToken: token },
      include: { customer: true, items: { include: { product: true } }, feedbacks: true },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.invoice.update({ where: { id }, data: { status } });
  }

  async verifyByCustomer(token: string, isApproved: boolean, comment?: string, rating?: number, ipAddress?: string) {
    const inv = await this.prisma.invoice.findUnique({ where: { verifyToken: token } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.verifiedAt) throw new BadRequestException('Invoice already verified');

    await this.prisma.invoiceFeedback.create({
      data: { invoiceId: inv.id, isApproved, comment, rating: rating || 0, ipAddress },
    });

    return this.prisma.invoice.update({
      where: { id: inv.id },
      data: { status: isApproved ? 'VERIFIED' : 'CANCELLED', verifiedAt: new Date(), verifiedBy: inv.customerId },
      include: { feedbacks: true },
    });
  }
}
