import { IsString, IsOptional, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString() productId: string;
  @IsNumber() quantity: number;
  @IsNumber() unitPrice: number;
  @IsOptional() @IsNumber() discount?: number;
}

export class CreateInvoiceDto {
  @IsString() customerId: string;
  @IsOptional() @IsString() distributorId?: string;
  @IsOptional() @IsString() routeId?: string;
  @IsOptional() @IsNumber() tax?: number;
  @IsOptional() @IsNumber() discount?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() dueDate?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
