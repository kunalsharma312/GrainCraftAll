import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'GrainCraft - Premium Heritage Grains & Custom Blends',
  description: 'Discover and order premium heritage grains, stone-milled fresh to order. Create custom blends tailored to your preferences.',
  keywords: 'heritage grains, stone milled, organic, custom blends, grain delivery',
  authors: [{ name: 'GrainCraft Team' }],
  openGraph: {
    title: 'GrainCraft - Premium Heritage Grains',
    description: 'Fresh stone-milled grains delivered to your door',
    url: 'https://graincraftapp.com',
    siteName: 'GrainCraft',
    locale: 'en_IN',
    type: 'website',
  },
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
