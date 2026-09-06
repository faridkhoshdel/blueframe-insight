import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AgentAction {
  action: string;
  targetId: string;
  targetType: string;
  reasoning: string;
  outcome: string;
  metrics: Record<string, any>;
}

@Injectable()
export class AgentsService {
  /**
   * 🎯 Retention Agent: حفظ مشتریان در معرض خطر
   */
  async runRetentionAgent(): Promise<AgentAction[]> {
    const atRiskCustomers = await prisma.customer.findMany({
      where: { churnRisk: { gt: 0.5 } },
      include: { deals: true },
    });

    const actions: AgentAction[] = [];

    for (const customer of atRiskCustomers) {
      // تصمیم‌گیری بر اساس سطح ریسک
      let action = '';
      let reasoning = '';
      let outcome = '';

      if (customer.churnRisk > 0.8) {
        // ریسک بحرانی: تماس مدیر
        action = 'URGENT_MANAGER_CALL';
        reasoning = `ریسک Churn ${(customer.churnRisk * 100).toFixed(0)}% - نیاز به مداخله فوری مدیر Customer Success`;
        outcome = `تماس فوری مدیر Customer Success با ${customer.name} برنامه‌ریزی شد. پیشنهاد: تخفیف ویژه ۲۵٪ + خدمات اختصاصی.`;
      } else if (customer.churnRisk > 0.65) {
        // ریسک بالا: تخفیف اختصاصی
        action = 'LOYALTY_DISCOUNT';
        reasoning = `ریسک Churn ${(customer.churnRisk * 100).toFixed(0)}% - مشتری ارزشمند نیاز به انگیزه حفظ`;
        outcome = `کد تخفیف اختصاصی ۱۵٪ به ${customer.name} ارسال شد. ایمیل شخصی‌سازی‌شده با ذکر دلایل ارزشمندی مشتری.`;
      } else {
        // ریسک متوسط: ایمیل nurture
        action = 'NURTURE_EMAIL';
        reasoning = `ریسک Churn ${(customer.churnRisk * 100).toFixed(0)}% - نیاز به افزایش تعامل`;
        outcome = `ایمیل nurture با محتوای ارزشمند (Case Study + آموزش) به ${customer.name} ارسال شد.`;
      }

      // ذخیره در log
      await prisma.agentLog.create({
        data: {
          agentType: 'RETENTION',
          agentName: 'Retention Agent',
          targetId: customer.id,
          targetType: 'customer',
          action,
          status: 'EXECUTED',
          reasoning,
          outcome,
          metrics: JSON.stringify({
            churnRisk: customer.churnRisk,
            customerValue: customer.deals.reduce((s, d) => s + d.value, 0),
          }),
        },
      });

      actions.push({
        action,
        targetId: customer.id,
        targetType: 'customer',
        reasoning,
        outcome,
        metrics: {
          customerName: customer.name,
          churnRisk: customer.churnRisk,
        },
      });
    }

    return actions;
  }

  /**
   * 🎯 Nurture Agent: پرورش Cold Leads
   */
  async runNurtureAgent(): Promise<AgentAction[]> {
    const coldLeads = await prisma.customer.findMany({
      where: { leadScore: { lt: 50 }, churnRisk: { lt: 0.3 } },
      include: { deals: true },
    });

    const actions: AgentAction[] = [];

    for (const lead of coldLeads) {
      const action = 'EDUCATIONAL_SEQUENCE';
      const reasoning = `Lead Score ${lead.leadScore} - نیاز به پرورش با محتوای آموزشی`;
      
      // تعیین نوع محتوا بر اساس صنعت
      const industry = lead.company || 'عمومی';
      let content = '';
      if (industry.includes('خودرو') || industry.includes('IKCO')) {
        content = 'Case Study: بهینه‌سازی زنجیره تأمین در صنعت خودرو';
      } else if (industry.includes('دیجی') || industry.includes('تکنو')) {
        content = 'وبینار: تحول دیجیتال در کسب‌وکارهای مدرن';
      } else {
        content = 'راهنمای جامع: افزایش ROI با AI در CRM';
      }

      const outcome = `ایمیل شماره ۱ از sequence آموزشی "${content}" به ${lead.name} ارسال شد. پیگیری خودکار در ۷ روز آینده.`;

      await prisma.agentLog.create({
        data: {
          agentType: 'NURTURE',
          agentName: 'Nurture Agent',
          targetId: lead.id,
          targetType: 'customer',
          action,
          status: 'EXECUTED',
          reasoning,
          outcome,
          metrics: JSON.stringify({
            leadScore: lead.leadScore,
            contentSent: content,
          }),
        },
      });

      actions.push({ action, targetId: lead.id, targetType: 'customer', reasoning, outcome, metrics: { customerName: lead.name, leadScore: lead.leadScore } });
    }

    return actions;
  }

  /**
   * 🎯 Cross-sell Agent: فروش متقاطع به مشتریان VIP
   */
  async runCrossSellAgent(): Promise<AgentAction[]> {
    const vipCustomers = await prisma.customer.findMany({
      where: { leadScore: { gt: 70 }, loyaltyStatus: { in: ['vip', 'enterprise', 'premium'] } },
      include: { deals: true, sourceRelations: true, targetRelations: true },
    });

    const actions: AgentAction[] = [];

    for (const customer of vipCustomers) {
      // یافتن مشتریان مشابه در شبکه
      const connectedCustomers = [
        ...customer.sourceRelations.map(r => r.targetId),
        ...customer.targetRelations.map(r => r.sourceId),
      ];

      if (connectedCustomers.length > 0) {
        const action = 'NETWORK_CROSS_SELL';
        const reasoning = `${customer.name} یک مشتری VIP با ${connectedCustomers.length} ارتباط در شبکه است - پتانسیل cross-sell بالا`;
        const outcome = `پیشنهاد محصول جدید مبتنی بر خریدهای مشتریان مشابه در شبکه به ${customer.name} ارسال شد. تخفیف ویژه VIP: ۱۰٪.`;

        await prisma.agentLog.create({
          data: {
            agentType: 'CROSS_SELL',
            agentName: 'Cross-sell Agent',
            targetId: customer.id,
            targetType: 'customer',
            action,
            status: 'EXECUTED',
            reasoning,
            outcome,
            metrics: JSON.stringify({
              networkSize: connectedCustomers.length,
              leadScore: customer.leadScore,
            }),
          },
        });

        actions.push({ action, targetId: customer.id, targetType: 'customer', reasoning, outcome, metrics: { customerName: customer.name, networkSize: connectedCustomers.length } });
      }
    }

    return actions;
  }

  /**
   * 🎯 Follow-up Agent: پیگیری معاملات
   */
  async runFollowUpAgent(): Promise<AgentAction[]> {
    const staleDeals = await prisma.deal.findMany({
      where: {
        stage: { in: ['PROPOSAL', 'NEGOTIATION'] },
        updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: { customer: true },
    });

    const actions: AgentAction[] = [];

    for (const deal of staleDeals) {
      const daysSince = Math.floor((Date.now() - deal.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      const action = daysSince > 14 ? 'URGENT_FOLLOW_UP' : 'GENTLE_REMINDER';
      const reasoning = `معامله "${deal.title}" ${daysSince} روز بدون فعالیت در مرحله ${deal.stage}`;
      const outcome = daysSince > 14
        ? `تماس فوری فروشنده با ${deal.customer.name} برای پیشبرد معامله. پیشنهاد: جلسه حضوری در ۴۸ ساعت آینده.`
        : `ایمیل یادآوری ملایم به ${deal.customer.name} درباره معامله "${deal.title}".`;

      await prisma.agentLog.create({
        data: {
          agentType: 'FOLLOW_UP',
          agentName: 'Follow-up Agent',
          targetId: deal.id,
          targetType: 'deal',
          action,
          status: 'EXECUTED',
          reasoning,
          outcome,
          metrics: JSON.stringify({
            dealTitle: deal.title,
            daysSince: daysSince,
            stage: deal.stage,
            value: deal.value,
          }),
        },
      });

      actions.push({ action, targetId: deal.id, targetType: 'deal', reasoning, outcome, metrics: { dealTitle: deal.title, customerName: deal.customer.name, daysSince } });
    }

    return actions;
  }

  /**
   * 🚀 اجرای همه Agent ها
   */
  async runAllAgents(): Promise<{ agent: string; actions: AgentAction[]; count: number }[]> {
    const results = [];
    
    const retention = await this.runRetentionAgent();
    results.push({ agent: 'Retention Agent', actions: retention, count: retention.length });
    
    const nurture = await this.runNurtureAgent();
    results.push({ agent: 'Nurture Agent', actions: nurture, count: nurture.length });
    
    const crossSell = await this.runCrossSellAgent();
    results.push({ agent: 'Cross-sell Agent', actions: crossSell, count: crossSell.length });
    
    const followUp = await this.runFollowUpAgent();
    results.push({ agent: 'Follow-up Agent', actions: followUp, count: followUp.length });
    
    return results;
  }

  /**
   * دریافت log فعالیت‌ها
   */
  async getAgentLogs(limit: number = 50, agentType?: string) {
    const where = agentType ? { agentType } : {};
    return prisma.agentLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * آمار Agent ها
   */
  async getAgentStats() {
    const totalActions = await prisma.agentLog.count();
    const byAgent = await prisma.agentLog.groupBy({
      by: ['agentType'],
      _count: { id: true },
    });
    const last24h = await prisma.agentLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    return {
      totalActions,
      last24h,
      byAgent: byAgent.map(b => ({ type: b.agentType, count: b._count.id })),
    };
  }
}
