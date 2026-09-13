import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('diagnostics')
export class DiagnosticsController {
  @Get('fonts')
  testFonts() {
    const cwd = process.cwd();
    const dirname = __dirname;
    
    const candidates = [
      path.join(cwd, 'assets/fonts'),
      path.join(cwd, 'apps/backend/assets/fonts'),
      path.join(dirname, '../../assets/fonts'),
      path.join(dirname, '../../../assets/fonts'),
      path.join(dirname, '../../../apps/backend/assets/fonts'),
      '/opt/render/project/src/apps/backend/assets/fonts',
    ];

    const result: any = {
      cwd,
      dirname,
      candidates: [],
      found: null,
      pdfkitInstalled: false,
    };

    for (const p of candidates) {
      const exists = fs.existsSync(p);
      const files = exists ? fs.readdirSync(p) : [];
      const hasVazir = files.some(f => f.includes('Vazirmatn'));
      
      result.candidates.push({
        path: p,
        exists,
        files,
        hasVazir,
      });

      if (exists && hasVazir && !result.found) {
        result.found = p;
      }
    }

    try {
      require.resolve('pdfkit');
      result.pdfkitInstalled = true;
    } catch (e: any) {
      result.pdfkitError = e.message;
    }

    return result;
  }

  @Get('pdf-test')
  async testPdf() {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      return new Promise((resolve) => {
        doc.on('data', (c: Buffer) => chunks.push(c));
        doc.on('end', () => {
          resolve({
            success: true,
            size: Buffer.concat(chunks).length,
            pdfkitVersion: require('pdfkit/package.json').version,
          });
        });
        doc.text('Hello PDF Test');
        doc.end();
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
