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
