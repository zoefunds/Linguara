import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Linguara — Trustworthy AI Translation', template: '%s | Linguara' },
  description: 'Decentralized AI consensus translation platform. Accurate, context-aware, and cryptographically verified across 100+ languages.',
  keywords: ['translation', 'AI', 'blockchain', 'GenLayer', 'multilingual', 'verified'],
  authors: [{ name: 'Linguara' }],
  openGraph: {
    title: 'Linguara — Trustworthy AI Translation',
    description: 'Decentralized AI consensus translation, verified on-chain.',
    type: 'website',
    url: 'https://linguara-sigma.vercel.app',
  },
  twitter: { card: 'summary_large_image', title: 'Linguara', description: 'AI-powered translation verified on-chain.' },
  metadataBase: new URL('https://linguara-sigma.vercel.app'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
