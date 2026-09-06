import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ScenarioResult {
  scenarioName: string;
  description: string;
  impact: {
    revenueChange: number;
    revenueChangePercent: number;
    customerLoss: number;
    churnRateChange: number;
    affectedCustomers: any[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  insights: string[];
  recommendations: string[];
  confidence: number;
}

@Injectable()
export class SimulatorService {
  /**
   * سناریوی ۱: تغییر قیمت
   */
  async simulatePriceChange(priceChangePercent: number): Promise<ScenarioResult> {
    const customers = await prisma.customer.findMany({
      include: { deals: true }
    });
    
    const currentRevenue = customers.reduce((sum, c) => {
      return sum + c.deals.reduce((s, d) => s + d.value, 0);
    }, 0);
    
    // محاسبه کشش قیمتی (Price Elasticity) بر اساس وفاداری
    let lostCustomers = 0;
    const affectedCustomers: any[] = [];
    
    for (const customer of customers) {
      // مشتریان با churnRisk بالا و loyaltyStatus پایین حساس‌تر به قیمت
      const sensitivity = customer.churnRisk * 0.8 + (customer.loyaltyStatus === 'new' ? 0.3 : 0);
      const probabilityToLeave = Math.min(0.9, sensitivity * Math.abs(priceChangePercent) / 100);
      
      if (Math.random() < probabilityToLeave) {
        lostCustomers++;
        const customerRevenue = customer.deals.reduce((s, d) => s + d.value, 0);
        affectedCustomers.push({
          name: customer.name,
          company: customer.company,
          lostRevenue: customerRevenue,
          probability: (probabilityToLeave * 100).toFixed(1),
        });
      }
    }
    
    const lostRevenue = affectedCustomers.reduce((s, c) => s + c.lostRevenue, 0);
    const newPriceRevenue = (currentRevenue - lostRevenue) * (1 + priceChangePercent / 100);
    const revenueChange = newPriceRevenue - currentRevenue;
    
    const riskLevel = lostCustomers > customers.length * 0.3 ? 'CRITICAL' :
                      lostCustomers > customers.length * 0.2 ? 'HIGH' :
                      lostCustomers > customers.length * 0.1 ? 'MEDIUM' : 'LOW';
    
    const insights = [
      `افزایش قیمت ${priceChangePercent}% منجر به از دست رفتن ${lostCustomers} مشتری از ${customers.length} می‌شود.`,
      `تغییر خالص درآمد: ${this.formatCurrency(revenueChange)} (${((revenueChange/currentRevenue)*100).toFixed(1)}%)`,
      `مشتریان VIP کمتر تحت تأثیر قرار می‌گیرند (وفاداری بالاتر).`,
    ];
    
    const recommendations = [];
    if (revenueChange < 0) {
      recommendations.push('⚠️ این سناریو منجر به کاهش درآمد می‌شود. پیشنهاد: افزایش تدریجی یا اعمال فقط برای مشتریان جدید.');
    } else {
      recommendations.push('✅ این سناریو درآمد را افزایش می‌دهد. پیشنهاد: همراه با کمپین وفاداری برای کاهش از دست رفتن.');
    }
    recommendations.push('🎯 ارائه تخفیف ویژه به مشتریان با churnRisk > 50% برای حفظ آن‌ها.');
    
    return {
      scenarioName: 'تغییر قیمت',
      description: `تغییر ${priceChangePercent > 0 ? 'افزایش' : 'کاهش'} قیمت ${Math.abs(priceChangePercent)}%`,
      impact: {
        revenueChange,
        revenueChangePercent: (revenueChange / currentRevenue) * 100,
        customerLoss: lostCustomers,
        churnRateChange: (lostCustomers / customers.length) * 100,
        affectedCustomers,
        riskLevel,
      },
      insights,
      recommendations,
      confidence: 0.75,
    };
  }
  
  /**
   * سناریوی ۲: از دست دادن یک مشتری کلیدی
   */
  async simulateCustomerLoss(customerId: string): Promise<ScenarioResult> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { 
        deals: true,
        sourceRelations: { include: { target: true } },
        targetRelations: { include: { source: true } }
      }
    });
    
    if (!customer) throw new Error('مشتری یافت نشد');
    
    const directRevenueLoss = customer.deals.reduce((s, d) => s + d.value, 0);
    
    // شناسایی مشتریان تحت تأثیر از طریق Knowledge Graph
    const connectedCustomers = [
      ...customer.sourceRelations.map(r => r.target),
      ...customer.targetRelations.map(r => r.source),
    ];
    
    const affectedCustomers: any[] = [];
    let secondaryRevenueRisk = 0;
    
    for (const conn of connectedCustomers) {
      // مشتریان مرتبط ۳۰٪ احتمال churn بیشتر
      const fullConn = await prisma.customer.findUnique({
        where: { id: conn.id },
        include: { deals: true }
      });
      if (!fullConn) continue;
      
      const connRevenue = fullConn.deals.reduce((s, d) => s + d.value, 0);
      const riskProbability = 0.3 + fullConn.churnRisk * 0.5;
      
      affectedCustomers.push({
        name: fullConn.name,
        company: fullConn.company,
        connectionType: 'مرتبط از طریق شبکه',
        riskProbability: (riskProbability * 100).toFixed(1),
        revenueAtRisk: connRevenue,
      });
      
      secondaryRevenueRisk += connRevenue * riskProbability;
    }
    
    const totalRisk = directRevenueLoss + secondaryRevenueRisk;
    const riskLevel = totalRisk > 100000000 ? 'CRITICAL' :
                      totalRisk > 50000000 ? 'HIGH' :
                      totalRisk > 20000000 ? 'MEDIUM' : 'LOW';
    
    const insights = [
      `از دست دادن "${customer.name}" منجر به از دست رفتن مستقیم ${this.formatCurrency(directRevenueLoss)} می‌شود.`,
      `${connectedCustomers.length} مشتری از طریق شبکه تحت تأثیر قرار می‌گیرند.`,
      `ریسک درآمد ثانویه: ${this.formatCurrency(secondaryRevenueRisk)}`,
      `تأثیر کلی بر کسب‌وکار: ${riskLevel === 'CRITICAL' ? 'بحرانی' : riskLevel === 'HIGH' ? 'بالا' : riskLevel === 'MEDIUM' ? 'متوسط' : 'پایین'}`,
    ];
    
    const recommendations = [
      '🚨 تماس فوری مدیر Customer Success برای حفظ مشتری',
      '🎁 ارائه پیشنهاد ویژه (تخفیف یا خدمات رایگان)',
      '📊 نظارت ۲۴/۷ بر مشتریان مرتبط در شبکه',
      `💼 تخصیص مدیر حساب اختصاصی برای ${connectedCustomers.length} مشتری مرتبط`,
    ];
    
    return {
      scenarioName: 'از دست دادن مشتری',
      description: `اگر "${customer.name}" را از دست بدهیم`,
      impact: {
        revenueChange: -directRevenueLoss,
        revenueChangePercent: -100 * directRevenueLoss / (directRevenueLoss + secondaryRevenueRisk + 1),
        customerLoss: 1 + affectedCustomers.filter(a => parseFloat(a.riskProbability) > 50).length,
        churnRateChange: (1 + affectedCustomers.length) * 10,
        affectedCustomers,
        riskLevel,
      },
      insights,
      recommendations,
      confidence: 0.85,
    };
  }
  
  /**
   * سناریوی ۳: کمپین بازاریابی
   */
  async simulateMarketingCampaign(
    targetSegment: string,
    budget: number
  ): Promise<ScenarioResult> {
    const customers = await prisma.customer.findMany({
      include: { deals: true }
    });
    
    // انتخاب مشتریان هدف بر اساس segment
    let targetCustomers: any[] = [];
    if (targetSegment === 'high_churn') {
      targetCustomers = customers.filter(c => c.churnRisk > 0.4);
    } else if (targetSegment === 'high_value') {
      targetCustomers = customers.filter(c => c.leadScore > 70);
    } else if (targetSegment === 'cold_leads') {
      targetCustomers = customers.filter(c => c.leadScore < 50);
    } else {
      targetCustomers = customers;
    }
    
    // محاسبه ROI بر اساس بودجه
    const conversionRate = targetSegment === 'high_value' ? 0.3 : 
                           targetSegment === 'high_churn' ? 0.5 : 0.15;
    const avgDealValue = customers.reduce((s, c) => 
      s + c.deals.reduce((ds, d) => ds + d.value, 0), 0) / customers.length;
    
    const expectedConversions = Math.floor(targetCustomers.length * conversionRate);
    const expectedRevenue = expectedConversions * avgDealValue;
    const roi = ((expectedRevenue - budget) / budget) * 100;
    
    const riskLevel = roi < 0 ? 'CRITICAL' :
                      roi < 50 ? 'HIGH' :
                      roi < 150 ? 'MEDIUM' : 'LOW';
    
    const affectedCustomers = targetCustomers.slice(0, 10).map(c => ({
      name: c.name,
      company: c.company,
      leadScore: c.leadScore,
      churnRisk: c.churnRisk,
    }));
    
    const insights = [
      `کمپین ${expectedConversions} تبدیل از ${targetCustomers.length} مشتری هدف ایجاد می‌کند.`,
      `نرخ تبدیل: ${(conversionRate * 100).toFixed(1)}%`,
      `درآمد مورد انتظار: ${this.formatCurrency(expectedRevenue)}`,
      `ROI: ${roi.toFixed(1)}% (${roi > 0 ? 'سودآور' : 'زیان‌ده'})`,
    ];
    
    const recommendations = [
      roi > 100 ? '✅ کمپین بسیار سودآور است. پیشنهاد: اجرای فوری.' : 
      roi > 0 ? '⚠️ کمپین سودآور است اما ROI پایین. پیشنهاد: بهینه‌سازی هدف‌گیری.' :
      '❌ کمپین زیان‌ده است. پیشنهاد: بازنگری استراتژی یا کاهش بودجه.',
      `🎯 تمرکز بر ${targetSegment === 'high_churn' ? 'مشتریان در معرض خطر' : 
         targetSegment === 'high_value' ? 'مشتریان با ارزش بالا' : 
         targetSegment === 'cold_leads' ? 'Lead های سرد' : 'همه مشتریان'}`,
      '📧 ترکیب با ایمیل شخصی‌سازی‌شده برای افزایش نرخ تبدیل',
    ];
    
    return {
      scenarioName: 'کمپین بازاریابی',
      description: `کمپین ${targetSegment} با بودجه ${this.formatCurrency(budget)}`,
      impact: {
        revenueChange: expectedRevenue - budget,
        revenueChangePercent: roi,
        customerLoss: 0,
        churnRateChange: targetSegment === 'high_churn' ? -expectedConversions * 5 : 0,
        affectedCustomers,
        riskLevel,
      },
      insights,
      recommendations,
      confidence: 0.70,
    };
  }
  
  /**
   * مقایسه چند سناریو
   */
  async compareScenarios(scenarios: any[]): Promise<any> {
    const results = [];
    for (const s of scenarios) {
      if (s.type === 'price_change') {
        results.push(await this.simulatePriceChange(s.value));
      } else if (s.type === 'customer_loss') {
        results.push(await this.simulateCustomerLoss(s.value));
      } else if (s.type === 'marketing') {
        results.push(await this.simulateMarketingCampaign(s.segment, s.budget));
      }
    }
    
    const bestScenario = results.reduce((best, curr) => 
      curr.impact.revenueChange > best.impact.revenueChange ? curr : best
    );
    
    return {
      scenarios: results,
      bestScenario: bestScenario.scenarioName,
      bestRevenueImpact: bestScenario.impact.revenueChange,
      comparison: results.map(r => ({
        name: r.scenarioName,
        revenueChange: r.impact.revenueChange,
        riskLevel: r.impact.riskLevel,
      })),
    };
  }
  
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fa-IR').format(Math.round(amount)) + ' ﷼';
  }
}
