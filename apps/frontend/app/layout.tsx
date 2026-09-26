import { DemoProvider } from '@/lib/demo/DemoContext';
import { Watermark, DemoBanner } from '@/lib/demo/Watermark';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/ThemeContext';
import InstallBanner from '@/components/InstallBanner';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['300', '400', '500', '700', '900'] });

export const metadata = {
  title: 'blueFrame Insight - پلتفرم هوشمند مدیریت کسب‌وکار',
  description: 'پلتفرم جامع تحلیل احساسات، مدیریت انبار و CRM با هوش مصنوعی',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              var t = localStorage.getItem('blueframe_theme') || 'light';
              if (t === 'dark' || t === 'light' || t === 'glass') {
                document.documentElement.setAttribute('data-theme', t);
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } else {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch (e) {
              document.documentElement.setAttribute('data-theme', 'light');
            }
          `,
        }}
      />

        <meta name="theme-color" content="#1e40af" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="blueFrame" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={vazir.className + ' antialiased'}>
        <ThemeProvider>
          <DemoProvider>
            <Watermark />
            <DemoBanner />
            <AuthProvider>{children}<InstallBanner /></AuthProvider>
          </DemoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
