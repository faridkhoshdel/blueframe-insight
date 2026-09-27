import { Public } from '../common/decorators/public.decorator';
import { Role, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { InvoiceService } from './invoice.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { Roles } from '../common/decorators/roles.decorator';
import type { Response } from 'express';
import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly pdfService: InvoicePdfService,
  ) {}

  @Post()
  create(@Req() req, @Body() dto: any) {
    return this.invoiceService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.invoiceService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.invoiceService.updateStatus(id, status);
  }

  @Public()
  @Get('verify/:token')
  findByToken(@Param('token') token: string) {
    return this.invoiceService.findByToken(token);
  }

  @Public()
  @Post('verify/:token')
  verifyByCustomer(
    @Param('token') token: string,
    @Body() body: any,
  ) {
    return this.invoiceService.verifyByCustomer(token, body.isApproved, body.comment, body.rating);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoiceService.findOne(id);
    const pdfBuffer = await this.pdfService.generate(invoice);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Public()
  @Get('verify/:token/pdf')
  async downloadPdfByToken(@Param('token') token: string, @Res() res: Response) {
    const invoice = await this.invoiceService.findByToken(token);
    const pdfBuffer = await this.pdfService.generate(invoice);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Post('generate-sample')
  async generateSample(@Req() req) {
    const prisma = new PrismaClient();
    try {
      const customer = await prisma.customer.findFirst();
      const product = await prisma.product.findFirst();
      const issuer = await prisma.user.findFirst();

      if (!customer) return { error: 'No customer', hint: 'Call /demo/seed' };
      if (!product) return { error: 'No product', hint: 'Call /demo/seed' };
      if (!issuer) return { error: 'No user/issuer' };

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: 'INV-TEST-' + Date.now().toString(36).toUpperCase(),
          customer: { connect: { id: customer.id } },
          issuer: { connect: { id: issuer.id } },
          subtotal: 7500000,
          tax: 675000,
          discount: 0,
          total: 8175000,
          status: 'DRAFT',
          notes: 'فاکتور تستی PDF',
          verifyToken: randomUUID(),
          items: {
            create: [{
              product: { connect: { id: product.id } },
              quantity: 5,
              unitPrice: 1500000,
              discount: 0,
              total: 7500000,
            }],
          },
        },
        include: {
          customer: true,
          issuer: true,
          items: { include: { product: true } }
        },
      });

      await prisma.$disconnect();
      return invoice;
    } catch (err: any) {
      await prisma.$disconnect();
      return { error: err.message, code: err.code, meta: err.meta };
    }
  }
}
