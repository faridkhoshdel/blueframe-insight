import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SentimentService } from './sentiment.service';
import { AnalyzeSentimentDto } from './dto/analyze-sentiment.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Sentiment Analysis')
@Controller('sentiment')
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
