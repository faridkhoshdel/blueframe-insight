import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsIn } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'نام محصول الزامی است' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'کد SKU الزامی است' })
  sku: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsNumber()
  @IsOptional()
  initialStock?: number;

  @IsString()
  @IsOptional()
  category?: string;
}

export class UpdateStockDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty({ message: 'تعداد تغییر الزامی است' })
  quantity: number;

  @IsIn(['IN', 'OUT', 'ADJUSTMENT'], { message: 'نوع حرکت باید IN، OUT یا ADJUSTMENT باشد' })
  type: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
