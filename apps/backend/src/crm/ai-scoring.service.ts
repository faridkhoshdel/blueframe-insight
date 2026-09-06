import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ScoreExplanation {
  factor: string;
  impact: number;
  description: string;
}

@Injectable()
export class AiScoringService {
  /**
   * الگوریتم Lead Scoring با توضیح‌پذیری کامل (XAI)
   * وزن‌دهی بر اساس Best Practices صنعتی (HubSpot, Salesforce)
   */
  async calculateLeadScore(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { deals: true },
    });
    if (!customer) throw new Error('مشتری یافت نشد');

    let score = 0;
    const explanations: ScoreExplanation[] = [];

    // فاکتور ۱: تعداد معاملات (Weight: 25%)
    const dealCount = customer.deals.length;
    const dealScore = Math.min(dealCount * 15, 40);
    score += dealScore;
    if (dealCount > 0) {
      explanations.push({
        factor: 'تعداد معاملات',
        impact: dealScore,
        description: `${dealCount} معامله فعال (هر معامله تا ۱۵ امتیاز)`,
      });
    }

    // فاکتور ۲: ارزش کل معاملات (Weight: 20%)
    const totalValue = customer.deals.reduce((s, d) => s + d.value, 0);
    const valueScore = Math.min(Math.log10(totalValue + 1) * 5, 30);
    score += valueScore;
    if (totalValue > 0) {
      explanations.push({
        factor: 'ارزش معاملات',
        impact: Math.round(valueScore),
        description: `مجموع ${(totalValue / 1000000).toFixed(1)}M تومان`,
      });
    }

    // فاکتور ۳: سیگنال‌های منفی (Weight: -30%)
    const negativePenalty = customer.negativeSignals * 10;
    score -= negativePenalty;
    if (customer.negativeSignals > 0) {
      explanations.push({
        factor: 'سیگنال‌های منفی',
        impact: -negativePenalty,
        description: `${customer.negativeSignals} سیگنال منفی (هر کدام -۱۰)`,
      });
    }

    // فاکتور ۴: تعامل اخیر (Weight: 15%)
    if (customer.lastInteraction) {
      const daysSince = Math.floor(
        (Date.now() - customer.lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
      );
      const recencyScore = Math.max(0, 20 - daysSince);
      score += recencyScore;
      explanations.push({
        factor: 'تازگی تعامل',
        impact: Math.round(recencyScore),
        description: `${daysSince} روز از آخرین تعامل`,
      });
    }

    // فاکتور ۵: تنوع مراحل در Pipeline (Weight: 10%)
    const uniqueStages = new Set(customer.deals.map(d => d.stage)).size;
    const diversityScore = uniqueStages * 5;
    score += diversityScore;
    if (uniqueStages > 1) {
      explanations.push({
        factor: 'تنوع مراحل',
        impact: diversityScore,
        description: `حضور در ${uniqueStages} مرحله مختلف`,
      });
    }

    // نرمال‌سازی بین 0 تا 100
    score = Math.max(0, Math.min(100, score));

    // تولید AI Insight (خلاصه فارسی)
    const aiInsights = this.generateInsight(score, explanations, customer);

    // ذخیره در دیتابیس
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        leadScore: score,
        aiInsights,
        engagementScore: score * 0.8,
      },
    });

    return {
      customerId,
      leadScore: Math.round(score),
      tier: this.getTier(score),
      explanations: explanations.sort((a, b) => b.impact - a.impact),
      aiInsights,
      recommendations: this.getRecommendations(score, explanations),
    };
  }

  private getTier(score: number): string {
    if (score >= 80) return 'Hot Lead 🔥';
    if (score >= 60) return 'Warm Lead 🌟';
    if (score >= 40) return 'Cold Lead 🧊';
    return 'Unqualified ⚪';
  }

  private generateInsight(score: number, explanations: ScoreExplanation[], customer: any): string {
    const topFactor = explanations.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))[0];
    if (score >= 80) {
      return `${customer.name} یک Lead داغ است. عامل کلیدی: ${topFactor?.description}. پیشنهاد: اولویت‌بندی برای تماس فوری.`;
    } else if (score >= 60) {
      return `${customer.name} پتانسیل خوبی دارد. ${topFactor?.description}. پیشنهاد: پرورش با محتوای آموزشی.`;
    } else if (score >= 40) {
      return `${customer.name} نیاز به پرورش دارد. ${topFactor?.description}. پیشنهاد: ایمیل nurturing sequence.`;
    }
    return `${customer.name} در حال حاضر اولویت ندارد. ${topFactor?.description}. پیشنهاد: انتقال به long-term nurture.`;
  }

  private getRecommendations(score: number, explanations: ScoreExplanation[]): string[] {
    const recs: string[] = [];
    if (score < 50) {
      recs.push('ارسال ایمیل آموزشی شخصی‌سازی‌شده');
      recs.push('برنامه‌ریزی تماس کشف مجدد در ۳۰ روز آینده');
    }
    if (score >= 60 && score < 80) {
      recs.push('ارسال Case Study مرتبط با صنعت مشتری');
      recs.push('پیشنهاد دمو یا جلسه مشاوره رایگان');
    }
    if (score >= 80) {
      recs.push('تماس فوری مدیر فروش');
      recs.push('ارسال پروپوزال سفارشی');
      recs.push('پیشنهاد تخفیف محدود زمانی');
    }
    const negativeFactor = explanations.find(e => e.impact < 0);
    if (negativeFactor) {
      recs.push('رسیدگی فوری به سیگنال‌های منفی');
      recs.push('تماس رضایت‌سنجی با مشتری');
    }
    return recs;
  }

  /**
   * محاسبه ریسک Churn (Probability 0-1)
   */
  async calculateChurnRisk(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { deals: true },
    });
    if (!customer) throw new Error('مشتری یافت نشد');

    let risk = 0;
    const factors: string[] = [];

    // فاکتور ۱: سیگنال‌های منفی (بیشترین وزن)
    if (customer.negativeSignals >= 3) {
      risk += 0.4;
      factors.push('۳+ سیگنال منفی اخیر');
    } else if (customer.negativeSignals >= 1) {
      risk += 0.15;
      factors.push('سیگنال منفی اخیر');
    }

    // فاکتور ۲: عدم تعامل طولانی
    if (customer.lastInteraction) {
      const daysSince = Math.floor(
        (Date.now() - customer.lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince > 60) {
        risk += 0.3;
        factors.push(`${daysSince} روز عدم تعامل`);
      } else if (daysSince > 30) {
        risk += 0.15;
        factors.push(`${daysSince} روز از آخرین تعامل`);
      }
    } else {
      risk += 0.2;
      factors.push('بدون تعامل ثبت‌شده');
    }

    // فاکتور ۳: تعداد کم معاملات
    if (customer.deals.length === 0) {
      risk += 0.25;
      factors.push('بدون معامله فعال');
    }

    // فاکتور ۴: معاملات از دست رفته
    const lostDeals = customer.deals.filter(d => d.stage === 'LOST').length;
    if (lostDeals > 0) {
      risk += Math.min(lostDeals * 0.1, 0.3);
      factors.push(`${lostDeals} معامله از دست رفته`);
    }

    risk = Math.min(risk, 1);

    await prisma.customer.update({
      where: { id: customerId },
      data: { churnRisk: risk },
    });

    return {
      customerId,
      churnRisk: risk,
      riskLevel: risk > 0.7 ? 'High 🔴' : risk > 0.4 ? 'Medium 🟡' : 'Low 🟢',
      factors,
      interventions: this.getChurnInterventions(risk, factors),
    };
  }

  private getChurnInterventions(risk: number, factors: string[]): string[] {
    const interventions: string[] = [];
    if (risk > 0.7) {
      interventions.push('تماس فوری مدیر Customer Success');
      interventions.push('ارائه تخفیف وفاداری اختصاصی');
      interventions.push('برنامه‌ریزی جلسه حضوری');
    } else if (risk > 0.4) {
      interventions.push('ارسال ایمیل شخصی با پیشنهاد ارزش افزوده');
      interventions.push('نظرسنجی رضایت‌سنجی');
    }
    return interventions;
  }

  /**
   * تحلیل دسته‌ای همه مشتریان
   */
  async analyzeAllCustomers() {
    const customers = await prisma.customer.findMany();
    const results = [];
    for (const customer of customers) {
      const leadScore = await this.calculateLeadScore(customer.id);
      const churnRisk = await this.calculateChurnRisk(customer.id);
      results.push({ customer: customer.name, ...leadScore, ...churnRisk });
    }
    return results;
  }
}
