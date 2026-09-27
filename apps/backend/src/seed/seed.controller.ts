import { SeedService } from './seed.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Controller, Delete, HttpCode, Post } from '@nestjs/common';
@ApiTags('System & Seeding')
@Controller('system/seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تولید داده‌های واقع‌گرایانه' })
  generate() {
    return this.seedService.generateRealisticData();
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'پاکسازی تمام داده‌ها' })
  clear() {
    return this.seedService.clearData();
  }
}
