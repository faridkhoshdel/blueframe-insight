import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateProductDto, UpdateStockDto } from './dto/inventory.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.WAREHOUSE_MANAGER, Role.ADMIN)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'افزودن محصول جدید' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.inventoryService.createProduct(dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'دریافت لیست محصولات' })
  getAllProducts() {
    return this.inventoryService.getAllProducts();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'جزئیات یک محصول' })
  getProduct(@Param('id') id: string) {
    return this.inventoryService.getProduct(id);
  }

  @Post('movements')
  @ApiOperation({ summary: 'ثبت حرکت انبار (ورود/خروج)' })
  updateStock(@Body() dto: UpdateStockDto) {
    return this.inventoryService.updateStock(dto);
  }

  @Get('alerts/low-stock')
  @ApiOperation({ summary: 'محصولات با موجودی کم' })
  getLowStockAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'آمار کلی انبار' })
  getDashboardStats() {
    return this.inventoryService.getDashboardStats();
  }
}
