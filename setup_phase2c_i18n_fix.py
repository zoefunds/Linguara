#!/usr/bin/env python3
"""Phase 2c — Fix next-intl App Router locale structure."""

import os, shutil

ROOT = "/Users/macbook/Linguara"
FE = f"{ROOT}/frontend/src"

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"  ✓ {path.replace(ROOT+'/', '')}")

def move(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.move(src, dst)
    print(f"  → moved {src.replace(ROOT+'/', '')} → {dst.replace(ROOT+'/', '')}")

# next-intl App Router requires pages under [locale] directory
# Structure: src/app/[locale]/page.tsx etc.

# Create locale directory
os.makedirs(f"{FE}/app/[locale]/(auth)/login", exist_ok=True)
os.makedirs(f"{FE}/app/[locale]/(auth)/register", exist_ok=True)
os.makedirs(f"{FE}/app/[locale]/(auth)/forgot-password", exist_ok=True)
os.makedirs(f"{FE}/app/[locale]/(dashboard)/translate", exist_ok=True)
os.makedirs(f"{FE}/app/[locale]/(dashboard)/history", exist_ok=True)
os.makedirs(f"{FE}/app/[locale]/(dashboard)/documents", exist_ok=True)
os.makedirs(f"{FE}/app/[locale]/(dashboard)/audit", exist_ok=True)
os.makedirs(f"{FE}/app/[locale]/(dashboard)/wallet", exist_ok=True)
os.makedirs(f"{FE}/app/[locale]/(dashboard)/settings", exist_ok=True)
os.makedirs(f"{FE}/app/[locale]/(dashboard)/reports", exist_ok=True)

# Move existing pages into [locale]
import glob

for src in glob.glob(f"{FE}/app/(auth)/**/*.tsx", recursive=True):
    dst = src.replace(f"{FE}/app/", f"{FE}/app/[locale]/")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    print(f"  ✓ copied → {dst.replace(ROOT+'/', '')}")

for src in glob.glob(f"{FE}/app/(dashboard)/**/*.tsx", recursive=True):
    dst = src.replace(f"{FE}/app/", f"{FE}/app/[locale]/")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    print(f"  ✓ copied → {dst.replace(ROOT+'/', '')}")

# Copy landing page
shutil.copy2(f"{FE}/app/page.tsx", f"{FE}/app/[locale]/page.tsx")
print(f"  ✓ copied landing page to [locale]")

# [locale] layout — wraps with NextIntlClientProvider
write(f"{FE}/app/[locale]/layout.tsx", """\
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'fr', 'es', 'de', 'pt', 'ar', 'zh', 'ja', 'ko', 'ru'];

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
""")

# Update root layout to not include NextIntlClientProvider (it's in [locale]/layout.tsx)
write(f"{FE}/app/layout.tsx", """\
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
""")

# Update middleware to handle the redirect properly
write(f"{FE}/middleware.ts", """\
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'fr', 'es', 'de', 'pt', 'ar', 'zh', 'ja', 'ko', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\\\..*).*)'],
};
""")

# Remove old app/page.tsx (keep only [locale]/page.tsx)
old_page = f"{FE}/app/page.tsx"
if os.path.exists(old_page):
    os.remove(old_page)
    print(f"  ✗ removed old app/page.tsx")

print("\n✓ i18n locale structure fixed")
