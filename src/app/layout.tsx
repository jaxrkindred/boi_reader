import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BOI Reader — The Beginning of Infinity',
  description:
    'Track your reading progress through The Beginning of Infinity by David Deutsch, with curated companion resources and an AI reading companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
