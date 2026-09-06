import { Injectable } from '@nestjs/common';
import { AnalyzeSentimentDto } from './dto/analyze-sentiment.dto';

@Injectable()
export class SentimentService {
  analyze(dto: AnalyzeSentimentDto) {
    const text = dto.text.toLowerCase();
    
    // دیکشنری ساده برای تحلیل احساسات فارسی (قابل توسعه با ParsBERT در فازهای بعدی)
    const negativeWords = ['بد', 'افتضاح', 'مشکل', 'خراب', 'تاخیر', 'عصبانی', 'بدترین', 'ضعیف', 'ناامید', 'زشت'];
    const positiveWords = ['عالی', 'خوب', 'ممنون', 'بی‌نظیر', 'سریع', 'راضی', 'بهترین', 'عالیه', 'خوشحالم', 'تشکر'];

    let score = 0;
    let detectedEmotion = 'Neutral';

    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 0.35;
    });

    positiveWords.forEach(word => {
      if (text.includes(word)) score += 0.35;
    });

    // محدود کردن امتیاز بین -1.0 تا +1.0
    score = Math.max(-1.0, Math.min(1.0, score));

    if (score >= 0.3) detectedEmotion = 'Satisfied';
    else if (score <= -0.3) detectedEmotion = 'Angry';
    else detectedEmotion = 'Neutral';

    return {
      success: true,
      data: {
        originalText: dto.text,
        score: parseFloat(score.toFixed(2)),
        emotion: detectedEmotion,
        isProcessed: true,
        aiSummary: `تحلیل اولیه نشان‌دهنده احساس ${detectedEmotion === 'Satisfied' ? 'مثبت و رضایت‌بخش' : detectedEmotion === 'Angry' ? 'منفی و نیازمند پیگیری فوری' : 'خنثی'} است.`,
        recommendations: score < 0 
          ? ['بررسی فوری تیکت پشتیبانی', 'تماس با مشتری برای عذرخواهی و جبران'] 
          : ['ثبت در بانک نظرات مثبت', 'ارسال کد تخفیف وفاداری'],
        timestamp: new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }),
      }
    };
  }
}
