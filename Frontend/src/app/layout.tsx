// app/layout.tsx

import type { Metadata } from 'next';
import { Poppins, Rammetto_One } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'], 
  variable: '--font-poppins', 
  display: 'swap',
});

const rammetto = Rammetto_One({
  subsets: ['latin'],
  weight: '400', 
  variable: '--font-rammetto', 
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SkyTopia',
  description: 'Platform manajemen daycare modern yang memudahkan pengelolaan anak, pembayaran, dan komunikasi dengan orang tua.',
  icons: {
    icon: [
      {
        url: '/skytopia-icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/skytopia-icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${rammetto.variable}`}>
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}