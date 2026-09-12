import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicePdfService {
  private fonts: any;

  constructor() {
    const fontsDir = path.join(process.cwd(), 'assets/fonts');
    this.fonts = {
      Vazirmatn: {
        normal: path.join(fontsDir, 'Vazirmatn-Regular.ttf'),
        bold: path.join(fontsDir, 'Vazirmatn-Bold.ttf'),
      },
    };
  }

  async generate(invoice: any): Promise<Buffer> {
    try {
      // pdfmake/src/printer برای Node.js
      // @ts-ignore
      const Printer = require('pdfmake/src/printer');
      const printer = new Printer(this.fonts);

      const customer = invoice.customer || {};
      const issuer = invoice.issuer || {};
      const items = invoice.items || [];

      const docDefinition: any = {
        defaultStyle: { font: 'Vazirmatn', fontSize: 10 },
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        content: [
          {
            columns: [
              { text: 'BLUEFRAME', style: 'companyName' },
              { alignment: 'right', text: 'فاکتور فروش', style: 'invoiceTitle' },
            ],
          },
          { text: '\n\n' },
          {
            columns: [
              {
                width: '50%',
                text: [
                  { text: 'اطلاعات فروشنده\n', style: 'sectionTitle' },
                  `نام: ${issuer.name || 'مدیر سیستم'}\n`,
                  `تاریخ صدور: ${this.formatDate(invoice.issuedAt || invoice.createdAt)}\n`,
                  `شماره فاکتور: ${invoice.invoiceNumber}\n`,
                ],
              },
              {
                width: '50%',
                alignment: 'right',
                text: [
                  { text: 'اطلاعات خریدار\n', style: 'sectionTitle' },
                  `${customer.name || 'نامشخص'}\n`,
                  `تلفن: ${customer.phone || '-'}\n`,
                  `ایمیل: ${customer.email || '-'}\n`,
                ],
              },
            ],
          },
          { text: '\n\n' },
          { text: 'اقلام فاکتور', style: 'sectionTitle' },
          { text: '\n' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 60, 80, 80, 90],
              body: [
                [
                  { text: 'نام محصول', style: 'tableHeader' },
                  { text: 'تعداد', style: 'tableHeader' },
                  { text: 'قیمت واحد', style: 'tableHeader' },
                  { text: 'تخفیف', style: 'tableHeader' },
                  { text: 'جمع', style: 'tableHeader' },
                ],
                ...items.map(i => [
                  i.product?.name || '-',
                  i.quantity.toString(),
                  this.formatMoney(i.unitPrice),
                  this.formatMoney(i.discount || 0),
                  this.formatMoney(i.total),
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
          },
          { text: '\n\n' },
          {
            alignment: 'left',
            table: {
              widths: [150, 100],
              body: [
                ['جمع کل:', this.formatMoney(invoice.subtotal || 0)],
                ['مالیات:', this.formatMoney(invoice.tax || 0)],
                ['تخفیف کل:', this.formatMoney(invoice.discount || 0)],
                [
                  { text: 'مبلغ قابل پرداخت:', style: 'tableHeader' },
                  { text: this.formatMoney(invoice.total || 0), style: 'tableHeader' },
                ],
              ],
            },
          },
          { text: '\n\n' },
          invoice.notes ? { text: `توضیحات: ${invoice.notes}`, italics: true } : {},
        ],
        footer: (currentPage: number, pageCount: number) => ({
          text: `صفحه ${currentPage} از ${pageCount} | Blueframe ERP`,
          alignment: 'center',
          fontSize: 8,
        }),
        styles: {
          companyName: { fontSize: 20, bold: true, color: '#2563eb' },
          invoiceTitle: { fontSize: 18, bold: true, color: '#1e293b' },
          sectionTitle: { fontSize: 12, bold: true, color: '#334155', margin: [0, 5, 0, 3] },
          tableHeader: { bold: true, fillColor: '#f1f5f9', color: '#0f172a' },
        },
      };

      const pdfDoc = printer.createPdfDocument(docDefinition);

      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);
        pdfDoc.end();
      });
    } catch (err: any) {
      console.error('PDF generation error:', err.message);
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
