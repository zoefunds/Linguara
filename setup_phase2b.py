#!/usr/bin/env python3
"""Phase 2b — Landing page, dashboard layout, translate page, history, audit, wallet, settings."""

import os

ROOT = "/Users/macbook/Linguara"
FE = f"{ROOT}/frontend/src"

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"  ✓ {path.replace(ROOT+'/', '')}")

# ─── LANDING PAGE ───
write(f"{FE}/app/page.tsx", """\
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { FAQ } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import { Toaster } from '@/components/ui/toaster';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
      <Toaster />
    </main>
  );
}
""")

write(f"{FE}/components/landing/navbar.tsx", """\
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-background/95 backdrop-blur border-b border-border shadow-sm' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Globe className="h-6 w-6 text-primary" />
            <span>Linguara</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="gradient" size="sm">Get started free</Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur px-4 py-4 space-y-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Link href="/auth/login"><Button variant="outline" className="w-full">Log in</Button></Link>
            <Link href="/auth/register"><Button variant="gradient" className="w-full">Get started free</Button></Link>
          </div>
        </div>
      )}
    </nav>
  );
}
""")

write(f"{FE}/components/landing/hero.tsx", """\
'use client';
import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Zap, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const stats = [
  { value: '2.4M+', label: 'Translations verified' },
  { value: '100+', label: 'Languages supported' },
  { value: '97.3%', label: 'Avg. confidence score' },
  { value: '99.9%', label: 'Uptime' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-background to-purple-950/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
          <Badge variant="info" className="gap-1.5 px-4 py-1.5 text-sm mx-auto inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by GenLayer AI Consensus
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Trustworthy Translations,{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Verified On-Chain
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Linguara uses decentralized AI consensus to deliver accurate, context-aware translations
            across 100+ languages — with cryptographic proof of quality on every output.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/register">
              <Button variant="gradient" size="xl" className="gap-2">
                Start translating free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="xl">See how it works</Button>
            </a>
          </div>

          <div className="flex flex-wrap gap-6 justify-center pt-4">
            {[
              { icon: Shield, text: 'On-chain verified' },
              { icon: Zap, text: 'Sub-60s consensus' },
              { icon: Globe2, text: '100+ languages' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Translation demo preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6 shadow-2xl shadow-indigo-500/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground font-medium">English</span>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-sm text-left leading-relaxed">
                  "This agreement shall be governed by and construed in accordance with the laws of the State of California."
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-xs text-muted-foreground font-medium">French · Consensus verified</span>
                </div>
                <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-4 text-sm text-left leading-relaxed">
                  "Le présent accord sera régi et interprété conformément aux lois de l'État de Californie."
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[97%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                </div>
                <span className="text-xs text-emerald-500 font-semibold">97% confidence</span>
              </div>
              <span className="text-xs text-muted-foreground">3 agents · Legal domain · On-chain ✓</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
""")

write(f"{FE}/components/landing/features.tsx", """\
'use client';
import { Brain, CheckCircle2, BarChart3, FileText, Scale, Wallet } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Consensus', desc: '3 independent AI agents translate simultaneously. Consensus determines the best output with semantic verification.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: CheckCircle2, title: 'Semantic Verification', desc: 'Meaning, tone, cultural context, and domain accuracy validated before every delivery.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: BarChart3, title: 'Confidence Scores', desc: 'Every translation ships with a cryptographically-backed trust score you can verify independently.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: FileText, title: 'Immutable Audit Trail', desc: 'Every translation decision is recorded on-chain via GenLayer. Permanent, tamper-proof, verifiable.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Scale, title: 'Legal & Healthcare', desc: 'Domain-specific models for contracts, medical records, government documents, and financial instruments.', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Wallet, title: 'Your Wallet, Your Identity', desc: 'Every account gets a unique Ethereum wallet. Your translation history is cryptographically yours.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold">Enterprise-grade translation infrastructure</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every translation passes through multi-agent AI consensus before delivery
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border/50 bg-card p-6 hover:border-primary/30 transition-colors group">
              <div className={`inline-flex p-3 rounded-lg ${f.bg} mb-4`}>
                <f.icon className={`h-6 w-6 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
""")

write(f"{FE}/components/landing/how-it-works.tsx", """\
'use client';

const steps = [
  { n: '01', title: 'Submit content', desc: 'Paste text, upload a document (PDF, DOCX), or drop an image. We auto-detect the source language.' },
  { n: '02', title: 'AI agents translate', desc: '3 independent GenLayer AI agents produce translations in parallel across your chosen domain.' },
  { n: '03', title: 'Consensus verification', desc: 'Semantic validators reach consensus on meaning preservation, tone, and cultural accuracy.' },
  { n: '04', title: 'Verified delivery', desc: 'Receive your translation with a confidence score, audit trail, and on-chain verification hash.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold">How Linguara works</h2>
          <p className="text-xl text-muted-foreground">From submission to verified translation in under 60 seconds</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          {steps.map((s, i) => (
            <div key={s.n} className="relative flex flex-col items-center text-center space-y-4">
              <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
                {s.n}
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
""")

write(f"{FE}/components/landing/pricing.tsx", """\
'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for individuals',
    features: ['50 translations/month', 'Text translation only', 'Basic confidence scores', 'Email support'],
    cta: 'Get started free',
    href: '/auth/register',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For professionals & teams',
    features: ['Unlimited translations', 'Document & image support', 'Advanced audit trail', 'All 6 domains', 'Priority processing', 'API access'],
    cta: 'Start free trial',
    href: '/auth/register',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: ['Custom volume', 'Dedicated validators', 'SLA guarantee', 'Custom domains', 'SSO / SAML', 'Dedicated support'],
    cta: 'Contact us',
    href: 'mailto:enterprise@linguara.app',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold">Simple, transparent pricing</h2>
          <p className="text-xl text-muted-foreground">No hidden fees. No surprise charges.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-2xl border p-8 flex flex-col gap-6 ${p.popular ? 'border-primary shadow-xl shadow-primary/20 bg-card' : 'border-border/50 bg-card/50'}`}>
              {p.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">Most popular</Badge>
              )}
              <div>
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{p.description}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground mb-1">{p.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href}>
                <Button className="w-full" variant={p.popular ? 'gradient' : 'outline'} size="lg">
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
""")

write(f"{FE}/components/landing/faq.tsx", """\
'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'What makes Linguara different from Google Translate or DeepL?', a: 'Linguara uses GenLayer Intelligent Contracts to coordinate multiple independent AI agents that each produce a translation. A consensus mechanism then verifies semantic equivalence. The result is a cryptographically-backed confidence score and an immutable on-chain audit trail — something no centralized service can provide.' },
  { q: 'What is the GenLayer consensus mechanism?', a: "GenLayer is a blockchain platform that supports non-deterministic computation. Linguara's Intelligent Contract runs multiple LLM-based translation agents and semantic validators in parallel, reaches consensus on the best output, and stores the verification result on-chain permanently." },
  { q: 'How accurate are the translations?', a: 'Our consensus approach consistently achieves 95–98% confidence on general content, and 90–95% on specialized domains like legal and medical. The confidence score tells you exactly how much to trust each translation.' },
  { q: 'What languages are supported?', a: 'Linguara supports 100+ languages including all major world languages, regional dialects, and right-to-left scripts such as Arabic, Hebrew, and Persian.' },
  { q: 'Can I export my translation history?', a: 'Yes. All translations and audit logs are exportable as JSON or CSV. Your data and your blockchain wallet are always yours.' },
  { q: 'Is my content stored permanently?', a: 'Source and translated text are stored securely in our database. The verification metadata (confidence scores, agent consensus, semantic scores) is stored on-chain via GenLayer for permanent verifiability.' },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-muted/30 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {f.q}
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground shrink-0 transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
""")

write(f"{FE}/components/landing/footer.tsx", """\
import Link from 'next/link';
import { Globe } from 'lucide-react';

const links = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How it works', href: '#how-it-works' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Globe className="h-5 w-5 text-primary" />
              <span>Linguara</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Trustworthy multilingual translation through decentralized AI consensus.
            </p>
            <p className="text-xs text-muted-foreground">Powered by GenLayer · StudioNet</p>
          </div>
          {Object.entries(links).map(([section, items]) => (
            <div key={section} className="space-y-4">
              <h4 className="font-semibold text-sm">{section}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Linguara. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Built on GenLayer · StudioNet · GEN</p>
        </div>
      </div>
    </footer>
  );
}
""")

# ─── DASHBOARD LAYOUT ───
write(f"{FE}/app/(dashboard)/layout.tsx", """\
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { useAuthStore } from '@/store/auth.store';
import Cookies from 'js-cookie';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) { router.push('/auth/login'); return; }
    if (!user) fetchMe().catch(() => router.push('/auth/login'));
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
""")

write(f"{FE}/components/dashboard/sidebar.tsx", """\
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Globe, Languages, Clock, FileText, Shield, Wallet, Settings, BarChart3, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: '/dashboard/translate', icon: Languages, label: 'Translate' },
  { href: '/dashboard/history', icon: Clock, label: 'History' },
  { href: '/dashboard/documents', icon: FileText, label: 'Documents' },
  { href: '/dashboard/audit', icon: Shield, label: 'Audit Trail' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Reports' },
  { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="hidden md:flex w-60 border-r border-border bg-card/50 flex-col">
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Globe className="h-5 w-5 text-primary" />
          <span>Linguara</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-3">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-foreground truncate">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
""")

write(f"{FE}/components/dashboard/header.tsx", """\
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';

const titles: Record<string, string> = {
  '/dashboard/translate': 'Translation Workspace',
  '/dashboard/history': 'Translation History',
  '/dashboard/documents': 'Documents',
  '/dashboard/audit': 'Audit Trail',
  '/dashboard/reports': 'Reports',
  '/dashboard/wallet': 'Wallet',
  '/dashboard/settings': 'Settings',
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <h1 className="font-semibold">{titles[pathname] || 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="info" className="hidden sm:inline-flex capitalize text-xs">{user?.plan?.toLowerCase()}</Badge>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
""")

# ─── TRANSLATE PAGE ───
write(f"{FE}/app/(dashboard)/translate/page.tsx", """\
'use client';
import { useState, useCallback } from 'react';
import { Copy, Check, ExternalLink, Loader2, Upload, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { translationApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn, getConfidenceColor, getConfidenceBg } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' }, { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' }, { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' }, { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }, { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }, { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' }, { code: 'sv', name: 'Swedish' },
];

const DOMAINS = [
  { value: 'general', label: 'General' },
  { value: 'legal', label: 'Legal' },
  { value: 'medical', label: 'Medical' },
  { value: 'technical', label: 'Technical' },
  { value: 'financial', label: 'Financial' },
  { value: 'government', label: 'Government' },
];

interface TranslationResult {
  translationId: string;
  finalTranslation: string;
  confidenceScore: number;
  semanticScore: number;
  toneScore: number;
  txHash?: string;
  agents?: any[];
}

export default function TranslatePage() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState('fr');
  const [domain, setDomain] = useState('general');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const pollForResult = async (id: string): Promise<void> => {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const { data } = await translationApi.get(id);
        const t = data.data;
        if (t.status === 'COMPLETED') {
          const consensus = t.results?.find((r: any) => r.isConsensus);
          setResult({
            translationId: id,
            finalTranslation: t.finalTranslation || consensus?.translatedText || '',
            confidenceScore: t.confidenceScore || consensus?.confidenceScore || 0,
            semanticScore: consensus?.semanticScore || 0,
            toneScore: consensus?.toneScore || 0,
            txHash: t.contractTxHash,
            agents: t.results,
          });
          return;
        }
        if (t.status === 'FAILED') throw new Error('Translation failed');
      } catch (e: any) {
        if (e.message === 'Translation failed') throw e;
      }
    }
    throw new Error('Timed out');
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({ variant: 'destructive', title: 'Enter text to translate' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await translationApi.create({ sourceText, targetLanguage: targetLang, domain });
      setLoading(false);
      setPolling(true);
      await pollForResult(data.data.translationId);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Translation failed', description: err.message });
    } finally {
      setLoading(false);
      setPolling(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.finalTranslation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button onClick={() => setMode('text')} className={cn('px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors', mode === 'text' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
            <AlignLeft className="h-3.5 w-3.5" />Text
          </button>
          <button onClick={() => setMode('file')} className={cn('px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors', mode === 'file' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
            <Upload className="h-3.5 w-3.5" />File
          </button>
        </div>

        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Target language" /></SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Domain" /></SelectTrigger>
          <SelectContent>
            {DOMAINS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Translation area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Source text</CardTitle>
              <span className="text-xs text-muted-foreground">{sourceText.length}/50,000</span>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-56 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground"
              placeholder="Enter text to translate... (auto-detect language)"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              maxLength={50000}
            />
          </CardContent>
        </Card>

        <Card className={cn('border-border/50', result && 'border-primary/30')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {LANGUAGES.find(l => l.code === targetLang)?.name || 'Translation'}
              </CardTitle>
              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">Consensus verified</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(loading || polling) ? (
              <div className="h-56 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm">{loading ? 'Submitting to GenLayer...' : 'AI agents translating...'}</p>
                <p className="text-xs">Consensus verification in progress</p>
              </div>
            ) : result ? (
              <div className="h-56 overflow-auto text-sm leading-relaxed">
                {result.finalTranslation}
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                Translation will appear here
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={handleTranslate} variant="gradient" size="lg" disabled={loading || polling || !sourceText.trim()} className="gap-2">
          {(loading || polling) ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</> : 'Translate with AI Consensus'}
        </Button>

        {result && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Tx:</span>
            <code className="font-mono">{result.txHash ? result.txHash.slice(0, 18) + '...' : 'pending'}</code>
          </div>
        )}
      </div>

      {/* Confidence scores */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Overall Confidence', score: result.confidenceScore },
            { label: 'Semantic Accuracy', score: result.semanticScore },
            { label: 'Tone & Style', score: result.toneScore },
          ].map(({ label, score }) => (
            <Card key={label} className="border-border/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <span className={cn('text-sm font-bold', getConfidenceColor(score))}>{score.toFixed(1)}%</span>
              </div>
              <Progress value={score} indicatorClassName={getConfidenceBg(score)} className="h-1.5" />
            </Card>
          ))}
        </div>
      )}

      {/* Agent breakdown */}
      {result?.agents && result.agents.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Agent Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.agents.map((agent: any) => (
                <div key={agent.agentId} className={cn('p-3 rounded-lg border text-sm', agent.isConsensus ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/50')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Agent {agent.agentId}</span>
                    <div className="flex items-center gap-2">
                      {agent.isConsensus && <Badge variant="success" className="text-xs">Selected</Badge>}
                      <span className={cn('font-semibold', getConfidenceColor(agent.confidence))}>{agent.confidence?.toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-2">{agent.translation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
""")

# ─── HISTORY PAGE ───
write(f"{FE}/app/(dashboard)/history/page.tsx", """\
'use client';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { translationApi } from '@/lib/api';
import { formatDate, getConfidenceColor, cn } from '@/lib/utils';

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'COMPLETED') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === 'FAILED') return <XCircle className="h-4 w-4 text-destructive" />;
  return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
};

export default function HistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: () => translationApi.list(1, 50).then(r => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  const translations = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data?.pagination?.total || 0} translations</p>
      </div>

      {translations.length === 0 ? (
        <Card className="border-border/50 p-12 text-center space-y-3">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No translations yet</p>
          <Link href="/dashboard/translate" className="text-primary hover:underline text-sm">
            Start your first translation →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {translations.map((t: any) => (
            <Card key={t.id} className="border-border/50 hover:border-primary/30 transition-colors">
              <div className="p-4 flex items-start gap-4">
                <StatusIcon status={t.status} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">{t.sourceLanguage}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">{t.targetLanguage}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{t.domain}</Badge>
                    {t.documentType !== 'TEXT' && <Badge variant="info" className="text-xs">{t.documentType}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{t.sourceText?.slice(0, 120)}...</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(t.createdAt)}</span>
                    {t.confidenceScore && (
                      <span className={cn('font-semibold', getConfidenceColor(t.confidenceScore))}>
                        {t.confidenceScore.toFixed(1)}% confidence
                      </span>
                    )}
                    {t.contractTxHash && (
                      <span className="font-mono text-indigo-400">
                        {t.contractTxHash.slice(0, 10)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
""")

# ─── AUDIT PAGE ───
write(f"{FE}/app/(dashboard)/audit/page.tsx", """\
'use client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Loader2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translationApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const eventColors: Record<string, string> = {
  TRANSLATION_CREATED: 'info',
  TRANSLATION_PROCESSING_STARTED: 'warning',
  TRANSLATION_COMPLETED: 'success',
  TRANSLATION_FAILED: 'destructive',
  WALLET_KEY_EXPORTED: 'warning',
};

export default function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => translationApi.audit(1, 100).then(r => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  const logs = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <p className="text-sm text-muted-foreground">{logs.length} audit events</p>

      {logs.length === 0 ? (
        <Card className="border-border/50 p-12 text-center space-y-3">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No audit events yet</p>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4 pl-12">
            {logs.map((log: any) => (
              <div key={log.id} className="relative">
                <div className="absolute -left-7 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                <Card className="border-border/50 p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant={(eventColors[log.eventType] as any) || 'secondary'} className="text-xs">
                      {log.eventType.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                  </div>
                  {log.onChainRef && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">On-chain:</span>
                      <code className="font-mono text-indigo-400">{log.onChainRef.slice(0, 24)}...</code>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  {log.payload && (
                    <pre className="text-xs text-muted-foreground bg-muted/30 rounded p-2 overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
""")

# ─── WALLET PAGE ───
write(f"{FE}/app/(dashboard)/wallet/page.tsx", """\
'use client';
import { useState } from 'react';
import { Wallet, Eye, EyeOff, Copy, Check, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function WalletPage() {
  const { user } = useAuthStore();
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addrCopied, setAddrCopied] = useState(false);

  const handleExport = async () => {
    if (!password) { toast({ variant: 'destructive', title: 'Enter your password' }); return; }
    setLoading(true);
    try {
      const { data } = await authApi.exportKey(password);
      setPrivateKey(data.data.privateKey);
      toast({ title: 'Private key exported', description: 'Store it securely and never share it.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export failed', description: err?.response?.data?.message || 'Invalid password' });
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.wallet?.address || '');
    setAddrCopied(true);
    setTimeout(() => setAddrCopied(false), 2000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(privateKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-lg"><Wallet className="h-5 w-5 text-indigo-400" /></div>
            <div>
              <CardTitle>Your Blockchain Wallet</CardTitle>
              <CardDescription>Auto-generated Ethereum wallet tied to your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Wallet address</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-muted/50 px-3 py-2.5 rounded-lg border border-border break-all">
                {user?.wallet?.address || 'Loading...'}
              </code>
              <Button variant="outline" size="icon" onClick={copyAddress}>
                {addrCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>This wallet is permanently associated with your Linguara account</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
            <div>
              <CardTitle>Export Private Key</CardTitle>
              <CardDescription>Password confirmation required. Never share your private key.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
            <p className="font-semibold">Security warning</p>
            <p className="text-xs">Anyone with your private key has full control of your wallet. Store it offline in a secure location.</p>
          </div>

          {!privateKey ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Confirm your password</Label>
                <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button onClick={handleExport} variant="outline" disabled={loading} className="gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10">
                {loading ? 'Verifying...' : 'Export private key'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Private key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted/50 px-3 py-2.5 rounded-lg border border-border break-all">
                  {showKey ? privateKey : '•'.repeat(64)}
                </code>
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={copyKey}>
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setPrivateKey(''); setPassword(''); }} className="text-muted-foreground">
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
""")

# ─── SETTINGS PAGE ───
write(f"{FE}/app/(dashboard)/settings/page.tsx", """\
'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { User, Bell, Globe, Shield } from 'lucide-react';

const LOCALES = [
  { code: 'en', name: 'English' }, { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }, { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' }, { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' }, { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }, { code: 'ru', name: 'Русский' },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [lang, setLang] = useState(user?.preferredLanguage || 'en');

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/auth/me', { fullName: name, preferredLanguage: lang });
      toast({ title: 'Settings saved' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg"><User className="h-5 w-5 text-primary" /></div>
            <div><CardTitle>Profile</CardTitle><CardDescription>Update your personal information</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email address</Label>
            <Input value={user?.email || ''} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label>Preferred language</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} variant="gradient" disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg"><Shield className="h-5 w-5 text-primary" /></div>
            <div><CardTitle>Account</CardTitle><CardDescription>Plan and account details</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current plan</p>
              <p className="text-sm text-muted-foreground">Your active subscription</p>
            </div>
            <Badge variant="info" className="capitalize">{user?.plan?.toLowerCase()}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email verification</p>
              <p className="text-sm text-muted-foreground">Account email status</p>
            </div>
            <Badge variant={user?.emailVerified ? 'success' : 'warning'}>
              {user?.emailVerified ? 'Verified' : 'Pending'}
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
""")

# ─── DASHBOARD INDEX REDIRECT ───
write(f"{FE}/app/(dashboard)/documents/page.tsx", """\
'use client';
import { FileText, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DocumentsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-border/50 p-12 text-center space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
        <div>
          <h2 className="text-xl font-semibold">Document Translation</h2>
          <p className="text-muted-foreground text-sm mt-1">Upload PDF or DOCX files for AI consensus translation</p>
        </div>
        <Link href="/dashboard/translate">
          <Button variant="gradient" className="gap-2"><Upload className="h-4 w-4" />Upload Document</Button>
        </Link>
      </Card>
    </div>
  );
}
""")

write(f"{FE}/app/(dashboard)/reports/page.tsx", """\
'use client';
import { BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { translationApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getConfidenceColor, cn } from '@/lib/utils';

export default function ReportsPage() {
  const { data } = useQuery({
    queryKey: ['translations-report'],
    queryFn: () => translationApi.list(1, 100).then(r => r.data),
  });

  const translations = data?.data || [];
  const completed = translations.filter((t: any) => t.status === 'COMPLETED');
  const avgConfidence = completed.length
    ? completed.reduce((acc: number, t: any) => acc + (t.confidenceScore || 0), 0) / completed.length
    : 0;

  const byDomain = completed.reduce((acc: Record<string, number>, t: any) => {
    acc[t.domain] = (acc[t.domain] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 p-5">
          <p className="text-sm text-muted-foreground">Total translations</p>
          <p className="text-3xl font-bold mt-1">{translations.length}</p>
        </Card>
        <Card className="border-border/50 p-5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold mt-1 text-emerald-500">{completed.length}</p>
        </Card>
        <Card className="border-border/50 p-5">
          <p className="text-sm text-muted-foreground">Avg. confidence</p>
          <p className={cn('text-3xl font-bold mt-1', getConfidenceColor(avgConfidence))}>
            {avgConfidence.toFixed(1)}%
          </p>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">By Domain</CardTitle></CardHeader>
        <CardContent>
          {Object.entries(byDomain).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byDomain).map(([domain, count]) => (
                <div key={domain} className="flex items-center gap-3">
                  <span className="text-sm capitalize w-24">{domain}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(count as number / Math.max(...Object.values(byDomain) as number[])) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{count as number}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
""")

print("✓ Phase 2b complete")
