import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class AnalyzeSentimentDto {
  @IsString()
  @IsNotEmpty({ message: 'متن نظر نمی‌تواند خالی باشد' })
  @MinLength(3, { message: 'متن باید حداقل ۳ کاراکتر باشد' })
  text: string;

  @IsOptional()
  @IsString()
  customerId?: string;
  
  @IsOptional()
  @IsString()
  productId?: string;
}
