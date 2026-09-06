import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto, UpdateStockDto } from './dto/inventory.dto';

const prisma = new PrismaClient();

@Injectable()
export class InventoryService {
  async createProduct(dto: CreateProductDto) {
    const existing = await prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existing) throw new BadRequestException('کد SKU تکراری است');

    return prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        price: dto.price,
        cost: dto.cost,
        stock: dto.initialStock || 0,
        category: dto.category,
      },
    });
  }

  async getAllProducts() {
    return prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { movements: true, feedbacks: true } } },
    });
  }

  async getProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { movements: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }

  async updateStock(dto: UpdateStockDto) {
    const product = await prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('محصول یافت نشد');

    let newStock = product.stock;
    if (dto.type === 'IN') newStock += dto.quantity;
    else if (dto.type === 'OUT') {
      if (product.stock < dto.quantity) throw new BadRequestException('موجودی کافی نیست');
      newStock -= dto.quantity;
    } else newStock = dto.quantity;

    const [movement, updatedProduct] = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: {
          productId: dto.productId,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
        },
      }),
      prisma.product.update({
        where: { id: dto.productId },
        data: { stock: newStock },
      }),
    ]);

    return { movement, product: updatedProduct };
  }

  async getLowStockAlerts() {
    return prisma.product.findMany({
      where: {
        stock: { lt: 5 },
      },
    });
  }

  async getDashboardStats() {
    const [totalProducts, totalStock, lowStock, movements] = await Promise.all([
      prisma.product.count(),
      prisma.product.aggregate({ _sum: { stock: true } }),
      prisma.product.count({ where: { stock: { lt: 5 } } }),
      prisma.inventoryMovement.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    return {
      totalProducts,
      totalStock: totalStock._sum.stock || 0,
      lowStockAlerts: lowStock,
      recentMovements: movements,
    };
  }
}
