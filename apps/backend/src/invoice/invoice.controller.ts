import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

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
}
