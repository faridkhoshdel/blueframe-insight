import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SentimentService } from './sentiment.service';
import { AnalyzeSentimentDto } from './dto/analyze-sentiment.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@ApiTags('Sentiment Analysis')
@Controller('sentiment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.AI_OPERATOR, Role.ADMIN)
export class SentimentController {
  constructor(private readonly sentimentService: SentimentService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تحلیل احساسات متن فارسی با هوش مصنوعی' })
  @ApiResponse({ status: 200, description: 'تحلیل با موفقیت انجام شد' })
  analyze(@Body() dto: AnalyzeSentimentDto) {
    return this.sentimentService.analyze(dto);
  }
}
