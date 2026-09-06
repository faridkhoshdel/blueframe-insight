import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

const prisma = new PrismaClient();

interface AnalysisResult {
  originalText: string;
  summary: string;
  sentiment: number;
  sentimentLabel: string;
  emotions: Record<string, number>;
  metadata: Record<string, any>;
}

@Injectable()
export class MultimodalService {
  private readonly groqApiKey = process.env.GROQ_API_KEY;
  private readonly isMockMode = !this.groqApiKey;

  /**
   * 🎙️ تحلیل صوت
   */
  async analyzeVoice(filePath: string, fileName: string): Promise<any> {
    console.log(`🎙️ Analyzing voice: ${fileName}`);

    if (this.isMockMode) {
      return await this.mockVoiceAnalysis(fileName);
    }

    // ۱. تبدیل صوت به متن با Whisper (Groq)
    const transcript = await this.transcribeWithGroq(filePath, fileName);

    // ۲. تحلیل احساسات متن
    const analysis = await this.analyzeTextSentiment(transcript);

    // ۳. ذخیره در دیتابیس
    const saved = await prisma.mediaAnalysis.create({
      data: {
        type: 'voice',
        title: fileName,
        originalText: transcript,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        sentimentLabel: analysis.sentimentLabel,
        emotions: JSON.stringify(analysis.emotions),
        metadata: JSON.stringify(analysis.metadata),
      },
    });

    // پاک کردن فایل موقت
    try { fs.unlinkSync(filePath); } catch (e) {}

    return saved;
  }

  private async transcribeWithGroq(filePath: string, fileName: string): Promise<string> {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), fileName);
    form.append('model', 'whisper-large-v3-turbo');
    form.append('language', 'fa');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
      },
      body: form as any,
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  }

  private async mockVoiceAnalysis(fileName: string): Promise<any> {
    const mockTexts = [
      'سلام، من از خدمات شما خیلی راضی هستم. تیم پشتیبانی عالیه و محصول واقعاً کیفیت خوبی داره. ممنون.',
      'متأسفانه تجربه خوبی نداشتم. چند بار تماس گرفتم ولی کسی پاسخگو نبود. کیفیت محصول هم پایین‌تر از انتظارم بود.',
      'خدمات معمولی بود. نه خوب نه بد. قیمت‌ها منصفانه است ولی سرعت پاسخگویی می‌تونه بهتر باشه.',
      'واقعاً فوق‌العاده بود! پیشنهاد من به همه دوستانم هم همینه. تیم فروش هم بسیار حرفه‌ای بود.',
    ];
    const mockText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    
    const isPositive = mockText.includes('راضی') || mockText.includes('عالی') || mockText.includes('فوق‌العاده');
    const isNegative = mockText.includes('متأسفانه') || mockText.includes('پایین');
    
    const saved = await prisma.mediaAnalysis.create({
      data: {
        type: 'voice',
        title: fileName,
        originalText: mockText,
        summary: isPositive ? 'بازخورد مثبت از مشتری با رضایت بالا' : isNegative ? 'بازخورد منفی با نارضایتی' : 'بازخورد خنثی',
        sentiment: isPositive ? 0.85 : isNegative ? -0.65 : 0.1,
        sentimentLabel: isPositive ? 'positive' : isNegative ? 'negative' : 'neutral',
        emotions: JSON.stringify({
          joy: isPositive ? 0.8 : 0.1,
          anger: isNegative ? 0.7 : 0.05,
          sadness: isNegative ? 0.4 : 0.05,
          trust: isPositive ? 0.75 : 0.3,
        }),
        duration: 30 + Math.floor(Math.random() * 60),
        metadata: JSON.stringify({ mode: 'mock', fileName }),
      },
    });
    return saved;
  }

  /**
   * 📸 تحلیل تصویر
   */
  async analyzeImage(filePath: string, fileName: string): Promise<any> {
    console.log(`📸 Analyzing image: ${fileName}`);

    if (this.isMockMode) {
      return await this.mockImageAnalysis(fileName);
    }

    const imageBase64 = fs.readFileSync(filePath).toString('base64');
    const ext = path.extname(fileName).slice(1);
    const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'این تصویر را تحلیل کن و احساسات شخص (اگر وجود دارد) را تشخیص بده. خروجی را به صورت JSON با این فرمت برگردان: {"emotion": "joy/sadness/anger/neutral", "confidence": 0-1, "description": "توضیح کوتاه فارسی"}'
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${imageBase64}` }
              }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch (e) { parsed = { emotion: 'neutral', confidence: 0.5, description: content }; }

    const sentimentMap: Record<string, number> = { joy: 0.8, neutral: 0, sadness: -0.6, anger: -0.7 };
    const sentiment = sentimentMap[parsed.emotion] || 0;

    const saved = await prisma.mediaAnalysis.create({
      data: {
        type: 'image',
        title: fileName,
        summary: parsed.description || 'تحلیل تصویر',
        sentiment,
        sentimentLabel: sentiment > 0.3 ? 'positive' : sentiment < -0.3 ? 'negative' : 'neutral',
        emotions: JSON.stringify({ [parsed.emotion]: parsed.confidence || 0.5 }),
        metadata: JSON.stringify({ fileName, emotion: parsed.emotion }),
      },
    });

    try { fs.unlinkSync(filePath); } catch (e) {}
    return saved;
  }

  private async mockImageAnalysis(fileName: string): Promise<any> {
    const emotions = ['joy', 'neutral', 'sadness', 'anger'];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = 0.6 + Math.random() * 0.35;
    
    const descriptions: Record<string, string> = {
      joy: 'چهره شاد با لبخند مشخص. زبان بدن باز و مثبت.',
      neutral: 'حالت چهره خنثی. بدون احساسات قوی.',
      sadness: 'چهره غمگین با ابروهای پایین. ممکن است نارضایتی نشان دهد.',
      anger: 'چهره عصبانی با اخم. نیاز به رسیدگی فوری.',
    };
    
    const sentimentMap: Record<string, number> = { joy: 0.8, neutral: 0, sadness: -0.6, anger: -0.7 };
    
    const saved = await prisma.mediaAnalysis.create({
      data: {
        type: 'image',
        title: fileName,
        summary: descriptions[emotion],
        sentiment: sentimentMap[emotion],
        sentimentLabel: sentimentMap[emotion] > 0.3 ? 'positive' : sentimentMap[emotion] < -0.3 ? 'negative' : 'neutral',
        emotions: JSON.stringify({ [emotion]: confidence }),
        metadata: JSON.stringify({ mode: 'mock', fileName, emotion, confidence }),
      },
    });
    return saved;
  }

  /**
   * 📝 خلاصه‌سازی متن طولانی
   */
  async analyzeLongText(text: string, title: string): Promise<any> {
    console.log(`📝 Analyzing long text: ${title} (${text.length} chars)`);

    if (this.isMockMode) {
      return await this.mockLongTextAnalysis(text, title);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'تو یک تحلیل‌گر حرفه‌ای بازخورد مشتریان هستی. پاسخ را فقط به صورت JSON برگردان.'
          },
          {
            role: 'user',
            content: `این متن بازخورد مشتری را تحلیل کن:\n\n"${text}"\n\nخروجی JSON:\n{"summary": "خلاصه ۲ جمله‌ای فارسی", "sentiment": عدد بین -1 تا 1, "sentimentLabel": "positive/negative/neutral", "emotions": {"joy": 0-1, "anger": 0-1, "sadness": 0-1, "trust": 0-1}, "keyPoints": ["نکته کلیدی ۱", "نکته کلیدی ۲"]}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch (e) { parsed = { summary: content, sentiment: 0, sentimentLabel: 'neutral', emotions: {} }; }

    const saved = await prisma.mediaAnalysis.create({
      data: {
        type: 'long_text',
        title,
        originalText: text,
        summary: parsed.summary || '',
        sentiment: parsed.sentiment || 0,
        sentimentLabel: parsed.sentimentLabel || 'neutral',
        emotions: JSON.stringify(parsed.emotions || {}),
        metadata: JSON.stringify({ keyPoints: parsed.keyPoints || [], charCount: text.length }),
      },
    });

    return saved;
  }

  private async mockLongTextAnalysis(text: string, title: string): Promise<any> {
    const isPositive = text.includes('خوب') || text.includes('راضی') || text.includes('عالی');
    const isNegative = text.includes('بد') || text.includes('ناراضی') || text.includes('مشکل');
    
    const saved = await prisma.mediaAnalysis.create({
      data: {
        type: 'long_text',
        title,
        originalText: text,
        summary: isPositive ? 'بازخورد مثبت با نکات قوت مشخص' : isNegative ? 'بازخورد منفی با مشکلات گزارش‌شده' : 'بازخورد خنثی با نظرات معمولی',
        sentiment: isPositive ? 0.7 : isNegative ? -0.5 : 0.1,
        sentimentLabel: isPositive ? 'positive' : isNegative ? 'negative' : 'neutral',
        emotions: JSON.stringify({
          joy: isPositive ? 0.7 : 0.1,
          anger: isNegative ? 0.5 : 0.05,
          trust: isPositive ? 0.8 : 0.3,
        }),
        metadata: JSON.stringify({ 
          mode: 'mock',
          keyPoints: ['نکته کلیدی ۱', 'نکته کلیدی ۲', 'نکته کلیدی ۳'],
          charCount: text.length 
        }),
      },
    });
    return saved;
  }

  /**
   * تحلیل متن مشترک
   */
  private async analyzeTextSentiment(text: string): Promise<AnalysisResult> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `احساسات این متن فارسی را تحلیل کن: "${text}"\n\nخروجی JSON: {"sentiment": -1 to 1, "sentimentLabel": "positive/negative/neutral", "summary": "خلاصه فارسی", "emotions": {"joy":0-1, "anger":0-1, "sadness":0-1, "trust":0-1}}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch (e) { parsed = { sentiment: 0, sentimentLabel: 'neutral', summary: text.slice(0, 100), emotions: {} }; }

    return {
      originalText: text,
      summary: parsed.summary || text.slice(0, 100),
      sentiment: parsed.sentiment || 0,
      sentimentLabel: parsed.sentimentLabel || 'neutral',
      emotions: parsed.emotions || {},
      metadata: {},
    };
  }

  /**
   * دریافت همه تحلیل‌ها
   */
  async getAll(type?: string, limit: number = 30) {
    return prisma.mediaAnalysis.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStats() {
    const total = await prisma.mediaAnalysis.count();
    const byType = await prisma.mediaAnalysis.groupBy({
      by: ['type'],
      _count: { id: true },
    });
    return { total, byType };
  }
}
