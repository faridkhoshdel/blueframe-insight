import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class InvoicePdfService {
  async generate(invoice: any): Promise<Buffer> {
    try {
      // @ts-ignore
      const PDFDocument = require('pdfkit');
      
      const fontsDir = path.join(process.cwd(), 'assets/fonts');
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `فاکتور ${invoice.invoiceNumber}`,
          Author: 'Blueframe ERP',
        }
      });

      // ثبت فونت فارسی
      doc.registerFont('Vazirmatn', path.join(fontsDir, 'Vazirmatn-Regular.ttf'));
      doc.registerFont('Vazirmatn-Bold', path.join(fontsDir, 'Vazirmatn-Bold.ttf'));

      const chunks: Buffer[] = [];
      
      return new Promise<Buffer>((resolve, reject) => {
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.font('Vazirmatn-Bold').fontSize(20).fillColor('#2563eb').text('BLUEFRAME', 50, 50);
        doc.font('Vazirmatn-Bold').fontSize(18).fillColor('#1e293b').text('فاکتور فروش', 50, 80, { align: 'right' });
        
        doc.moveDown(2);

        // اطلاعات فروشنده و خریدار
        const customer = invoice.customer || {};
        const issuer = invoice.issuer || {};
        const items = invoice.items || [];

        doc.font('Vazirmatn-Bold').fontSize(12).fillColor('#334155').text('اطلاعات فروشنده:', 50);
        doc.font('Vazirmatn').fontSize(10).fillColor('#000');
        doc.text(`نام: ${issuer.name || 'مدیر سیستم'}`);
        doc.text(`تاریخ صدور: ${this.formatDate(invoice.issuedAt || invoice.createdAt)}`);
        doc.text(`شماره فاکتور: ${invoice.invoiceNumber}`);

        doc.moveDown(1.5);

        doc.font('Vazirmatn-Bold').fontSize(12).fillColor('#334155').text('اطلاعات خریدار:', 50);
        doc.font('Vazirmatn').fontSize(10).fillColor('#000');
        doc.text(`${customer.name || 'نامشخص'}`);
        doc.text(`تلفن: ${customer.phone || '-'}`);
        doc.text(`ایمیل: ${customer.email || '-'}`);

        doc.moveDown(2);

        // جدول اقلام
        doc.font('Vazirmatn-Bold').fontSize(12).fillColor('#334155').text('اقلام فاکتور:', 50);
        doc.moveDown(0.5);

        // Header جدول
        const tableTop = doc.y;
        doc.font('Vazirmatn-Bold').fontSize(10).fillColor('#0f172a');
        doc.rect(50, tableTop, 495, 20).fill('#f1f5f9');
        doc.fillColor('#000');
        
        doc.text('نام محصول', 55, tableTop + 5);
        doc.text('تعداد', 250, tableTop + 5);
        doc.text('قیمت واحد', 320, tableTop + 5);
        doc.text('تخفیف', 400, tableTop + 5);
        doc.text('جمع', 470, tableTop + 5);

        doc.moveDown(1.5);

        // ردیف‌های جدول
        doc.font('Vazirmatn').fontSize(10);
        items.forEach((item: any) => {
          doc.text(item.product?.name || '-', 55);
          doc.text(item.quantity.toString(), 250);
          doc.text(this.formatMoney(item.unitPrice), 320);
          doc.text(this.formatMoney(item.discount || 0), 400);
          doc.text(this.formatMoney(item.total), 470);
          doc.moveDown(0.8);
        });

        doc.moveDown(2);

        // جمع کل
        doc.font('Vazirmatn-Bold').fontSize(11);
        doc.text(`جمع کل: ${this.formatMoney(invoice.subtotal || 0)}`, 350);
        doc.text(`مالیات: ${this.formatMoney(invoice.tax || 0)}`, 350);
        doc.text(`تخفیف کل: ${this.formatMoney(invoice.discount || 0)}`, 350);
        
        doc.moveDown(0.5);
        doc.font('Vazirmatn-Bold').fontSize(13).fillColor('#2563eb');
        doc.text(`مبلغ قابل پرداخت: ${this.formatMoney(invoice.total || 0)}`, 350);

        doc.moveDown(2);

        // توضیحات
        if (invoice.notes) {
          doc.font('Vazirmatn').fontSize(10).fillColor('#64748b');
          doc.text(`توضیحات: ${invoice.notes}`, 50, doc.y, { italic: true });
        }

        // Footer
        doc.font('Vazirmatn').fontSize(8).fillColor('#94a3b8');
        doc.text('صفحه 1 از 1 | Blueframe ERP', 50, 750, { align: 'center' });

        doc.end();
      });
    } catch (err: any) {
      console.error('PDF generation error:', err.message, err.stack);
      throw err;
    }
  }

  private formatDate(d: any): string {
    try {
      return new Date(d).toLocaleDateString('fa-IR');
    } catch {
      return '-';
    }
  }

  private formatMoney(n: number): string {
    return new Intl.NumberFormat('fa-IR').format(Math.round(n)) + ' ریال';
  }
}
