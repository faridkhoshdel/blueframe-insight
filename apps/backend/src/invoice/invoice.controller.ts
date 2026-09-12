import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Patch, Res, Header } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoicePdfService } from './invoice-pdf.service';
import type { Response } from 'express';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService, private readonly pdfService: InvoicePdfService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() filters: any) {
    return this.invoiceService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.invoiceService.updateStatus(id, status);
  }

  // Public endpoint for customer verification
  @Get('verify/:token')
  findByToken(@Param('token') token: string) {
    return this.invoiceService.findByToken(token);
  }

  @Post('verify/:token')
  verifyByCustomer(
    @Param('token') token: string,
    @Body() body: { isApproved: boolean; comment?: string; rating?: number; phone?: string; nationalId?: string },
  ) {
    return this.invoiceService.verifyByCustomer(token, body.isApproved, body.comment, body.rating);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post('generate-sample')
  async generateSample(@Request() req) {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const customer = await prisma.customer.findFirst();
    const product = await prisma.product.findFirst();
    
    if (!customer || !product) {
      throw new Error('No customer or product found in database');
    }
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-TEST-' + Date.now().toString(36).toUpperCase(),
        customerId: customer.id,
        issuerId: req.user.id,
        subtotal: 7500000,
        tax: 675000,
        discount: 0,
        total: 8175000,
        status: 'DRAFT',
        notes: 'فاکتور تستی برای بررسی PDF',
        verifyToken: require('crypto').randomUUID(),
        items: {
          create: [{
            productId: product.id,
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
    
    return invoice;
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-sample')
  async generateSample(@Request() req) {
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
