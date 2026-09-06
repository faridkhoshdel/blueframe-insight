import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class SeedService {
  async generateRealisticData() {
    console.log('🌱 شروع تولید داده‌های واقع‌گرایانه...');

    // مشتریان با پروفایل‌های متنوع
    const customers = [
      {
        name: 'شرکت دیجی‌کالا',
        email: 'procurement@digikala.com',
        phone: '021-61234567',
        company: 'Digikala',
        ltv: 150000000,
        loyaltyStatus: 'vip',
        leadScore: 92,
        churnRisk: 0.05,
        engagementScore: 88,
        interactionCount: 47,
        negativeSignals: 0,
        lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        aiInsights: 'مشتری بسیار ارزشمند با تعامل مداوم. احتمال تمدید قرارداد ۹۵٪.'
      },
      {
        name: 'شرکت اسنپ‌فود',
        email: 'business@snappfood.ir',
        phone: '021-91000123',
        company: 'Snapp Food',
        ltv: 85000000,
        loyaltyStatus: 'premium',
        leadScore: 76,
        churnRisk: 0.15,
        engagementScore: 72,
        interactionCount: 23,
        negativeSignals: 1,
        lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        aiInsights: 'مشتری با پتانسیل بالا. نیاز به پیگیری هفتگی برای حفظ تعامل.'
      },
      {
        name: 'فروشگاه رفاه',
        email: 'it@refah.ir',
        phone: '021-88776655',
        company: 'Refah Chain Stores',
        ltv: 45000000,
        loyaltyStatus: 'regular',
        leadScore: 58,
        churnRisk: 0.35,
        engagementScore: 45,
        interactionCount: 8,
        negativeSignals: 2,
        lastInteraction: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        aiInsights: 'کاهش تعامل در ۳ هفته گذشته. نیاز به تماس شخصی برای بررسی علت.'
      },
      {
        name: 'شرکت کاله',
        email: 'purchase@kalleh.com',
        phone: '021-22334455',
        company: 'Kalleh Dairy',
        ltv: 25000000,
        loyaltyStatus: 'regular',
        leadScore: 34,
        churnRisk: 0.65,
        engagementScore: 28,
        interactionCount: 4,
        negativeSignals: 4,
        lastInteraction: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        aiInsights: 'ریسک بالای از دست رفتن. ۴ تیکت منفی اخیر + ۴۵ روز عدم تعامل. اقدام فوری ضروری است.'
      },
      {
        name: 'استارتاپ تکنو‌لایف',
        email: 'ceo@technolife.ir',
        phone: '09121234567',
        company: 'TechnoLife',
        ltv: 5000000,
        loyaltyStatus: 'new',
        leadScore: 82,
        churnRisk: 0.08,
        engagementScore: 90,
        interactionCount: 12,
        negativeSignals: 0,
        lastInteraction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        aiInsights: 'Lead بسیار داغ با تعامل بالا. پیشنهاد ارسال پروپوزال فوری.'
      },
      {
        name: 'شرکت ایران‌خودرو',
        email: 'vendor@ikco.ir',
        phone: '021-44556677',
        company: 'IKCO',
        ltv: 200000000,
        loyaltyStatus: 'enterprise',
        leadScore: 88,
        churnRisk: 0.12,
        engagementScore: 75,
        interactionCount: 34,
        negativeSignals: 1,
        lastInteraction: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        aiInsights: 'مشتری enterprise با قرارداد بلندمدت. نیاز به مدیر حساب اختصاصی.'
      }
    ];

    // ساخت مشتریان
    const createdCustomers = [];
    for (const c of customers) {
      const customer = await prisma.customer.create({
        data: c
      });
      createdCustomers.push(customer);
    }

    // تولید Activity های واقع‌گرایانه
    const activityTypes = [
      { type: 'EMAIL', titles: ['ایمیل معرفی محصول جدید', 'خبرنامه ماهانه', 'پیشنهاد ویژه'] },
      { type: 'CALL', titles: ['تماس پیگیری فروش', 'تماس رضایت‌سنجی', 'جلسه آنلاین'] },
      { type: 'MEETING', titles: ['جلسه حضوری', 'جلسه پرزنت محصول', 'جلسه مذاکره قرارداد'] },
      { type: 'TICKET', titles: ['تیکت پشتیبانی', 'درخواست ویژگی جدید', 'گزارش باگ'] },
      { type: 'DEAL', titles: ['معامله جدید ایجاد شد', 'پروپوزال ارسال شد', 'قرارداد تمدید شد'] },
      { type: 'FEEDBACK', titles: ['بازخورد مثبت دریافت شد', 'بازخورد منفی ثبت شد', 'نظرسنجی تکمیل شد'] },
    ];

    const activities = [];
    for (const customer of createdCustomers) {
      const numActivities = 5 + Math.floor(Math.random() * 15);
      
      for (let i = 0; i < numActivities; i++) {
        const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const randomTitle = randomType.titles[Math.floor(Math.random() * randomType.titles.length)];
        const daysAgo = Math.floor(Math.random() * 60);
        
        activities.push({
          customerId: customer.id,
          type: randomType.type,
          title: randomTitle,
          description: this.generateDescription(randomType.type, randomTitle, customer.name),
          metadata: JSON.stringify({ 
            source: 'system',
            sentiment: randomType.type === 'FEEDBACK' ? (Math.random() > 0.5 ? 'positive' : 'negative') : 'neutral'
          }),
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        });
      }
    }

    // افزودن Activity ها به صورت دسته‌ای
    for (const activity of activities) {
      await prisma.activity.create({ data: activity });
    }

    // تولید معاملات
    const stages = ['LEAD', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    for (const customer of createdCustomers) {
      const numDeals = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numDeals; i++) {
        await prisma.deal.create({
          data: {
            customerId: customer.id,
            title: `پروژه ${customer.name} - فاز ${i + 1}`,
            value: Math.floor(Math.random() * 50000000) + 5000000,
            stage: stages[Math.floor(Math.random() * stages.length)],
            probability: Math.floor(Math.random() * 100),
            notes: 'معامله ایجاد شده توسط سیستم seeding'
          }
        });
      }
    }

    console.log(`✅ ${createdCustomers.length} مشتری با Activity ها و Deals ساخته شد`);

    // تولید روابط بین مشتریان
    const relationshipTypes = [
      { type: 'INDUSTRY', desc: 'صنعت یکسان' },
      { type: 'REFERRAL', desc: 'معرفی به یکدیگر' },
      { type: 'PARTNER', desc: 'شریک تجاری' },
      { type: 'COMPETITOR', desc: 'رقیب' },
      { type: 'SUPPLIER', desc: 'تأمین‌کننده' },
    ];

    let relCount = 0;
    for (let i = 0; i < createdCustomers.length; i++) {
      const numRels = 2 + Math.floor(Math.random() * 3);
      const targets = createdCustomers.filter((_, idx) => idx !== i);
      
      for (let j = 0; j < numRels && j < targets.length; j++) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const relType = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
        
        const exists = await prisma.relationship.findFirst({
          where: {
            OR: [
              { sourceId: createdCustomers[i].id, targetId: target.id, type: relType.type },
              { sourceId: target.id, targetId: createdCustomers[i].id, type: relType.type }
            ]
          }
        });
        
        if (!exists) {
          await prisma.relationship.create({
            data: {
              sourceId: createdCustomers[i].id,
              targetId: target.id,
              type: relType.type,
              strength: 0.3 + Math.random() * 0.7,
              description: relType.desc
            }
          });
          relCount++;
        }
      }
    }
    console.log(`✅ ${relCount} رابطه ایجاد شد`);

    
    return {
      customers: createdCustomers.length,
      activities: activities.length,
      message: 'داده‌های واقع‌گرایانه با موفقیت تولید شد'
    };
  }

  private generateDescription(type: string, title: string, customerName: string): string {
    const descriptions: Record<string, string> = {
      'EMAIL': `ایمیل به ${customerName} با موضوع ${title} ارسال شد`,
      'CALL': `تماس ۱۵ دقیقه‌ای با ${customerName} درباره ${title}`,
      'MEETING': `جلسه ${title} با حضور نمایندگان ${customerName}`,
      'TICKET': `تیکت "${title}" از طرف ${customerName} ثبت شد`,
      'DEAL': `${title} برای ${customerName} ایجاد شد`,
      'FEEDBACK': `${title} توسط ${customerName} ثبت شد`
    };
    return descriptions[type] || title;
  }

  async clearData() {
    console.log('🧹 پاکسازی داده‌های قدیمی...');
    await prisma.activity.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.customer.deleteMany();
    console.log('✅ تمام داده‌ها پاک شد');
    return { message: 'داده‌ها پاک شدند' };
  }
}
