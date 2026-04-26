import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'اختبر معلوماتك | منصة تعليمية احترافية',
  description: 'منصة اختبر معلوماتك التعليمية - اختبارات وتلخيصات لجميع المراحل تحت إشراف أ/ أسماء محمد نجيب',
  keywords: ['اختبارات', 'تعليم', 'ابتدائي', 'إعدادي', 'تلخيصات', 'اختبر معلوماتك']
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e3a8a'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="https://res.cloudinary.com/drqoyjclh/image/upload/v1771441043/%D9%84%D9%88%D8%AC%D9%88_ctftwp.png"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
