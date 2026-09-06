import { Controller, Post, Get, Query, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { MultimodalService } from './multimodal.service';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Multimodal AI')
@Controller('multimodal')
export class MultimodalController {
  constructor(private readonly service: MultimodalService) {}

  @Post('voice')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req: Request, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'voice-' + uniqueSuffix + extname(file.originalname));
      }
    }),
    limits: { fileSize: 25 * 1024 * 1024 },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'تحلیل فایل صوتی' })
  async analyzeVoice(@UploadedFile() file: any) {
    if (!file) throw new Error('فایل صوتی ارسال نشده');
    return this.service.analyzeVoice(file.path, file.originalname);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req: Request, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'image-' + uniqueSuffix + extname(file.originalname));
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'تحلیل تصویر' })
  async analyzeImage(@UploadedFile() file: any) {
    if (!file) throw new Error('تصویر ارسال نشده');
    return this.service.analyzeImage(file.path, file.originalname);
  }

  @Post('text')
  @ApiOperation({ summary: 'خلاصه‌سازی متن طولانی' })
  async analyzeText(@Body('text') text: string, @Body('title') title: string) {
    if (!text) throw new Error('متن ارسال نشده');
    return this.service.analyzeLongText(text, title || 'بدون عنوان');
  }

  @Get('all')
  @ApiOperation({ summary: 'دریافت همه تحلیل‌ها' })
  async getAll(@Query('type') type?: string, @Query('limit') limit?: string) {
    return this.service.getAll(type, limit ? parseInt(limit) : 30);
  }

  @Get('stats')
  @ApiOperation({ summary: 'آمار تحلیل‌ها' })
  async getStats() {
    return this.service.getStats();
  }
}
