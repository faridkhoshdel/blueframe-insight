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
}
