'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Zap, Globe2 } from 'lucide-react';

const stats = [
  { value: '100+', label: 'Languages' },
  { value: '5', label: 'AI validators' },
  { value: '97%', label: 'Avg. confidence' },
  { value: '99.9%', label: 'Uptime' },
];

const badges = [
  { icon: Shield, text: 'On-chain verified' },
  { icon: Zap, text: 'Sub-90s consensus' },
  { icon: Globe2, text: '100+ languages' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 bg-[#efece4]">
      {/* Subtle texture circles */}
      <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-purple-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-24 text-center space-y-8">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 border border-[#d4cfc0] bg-white/60 px-4 py-1.5 rounded-full text-xs font-medium text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Powered by GenLayer on-chain AI consensus
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-foreground">
          Break Language Barriers<br />
          <span className="font-serif italic font-normal text-primary">with AI-Powered</span><br />
          Precision.
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
          Experience the next generation of global communication. Seamlessly translate documents,
          conversations, and enterprise content with decentralized AI verification across 100+ languages.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-foreground text-[#efece4] font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity text-sm"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-[#d4cfc0] bg-white/60 text-foreground font-medium px-8 py-3.5 rounded-full hover:bg-white/80 transition-colors text-sm"
          >
            Watch Demo
          </a>
        </div>

        {/* Trust */}
        <div className="flex flex-wrap gap-6 justify-center pt-2">
          {badges.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" />
              {text}
            </div>
          ))}
        </div>

        {/* Social proof */}
        <p className="text-xs text-muted-foreground">
          Trusted by <span className="font-semibold text-foreground">10k+ global enterprises</span>
        </p>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#d4cfc0] rounded-2xl overflow-hidden border border-[#d4cfc0]">
          {stats.map((s) => (
            <div key={s.label} className="text-center py-8 px-6 bg-[#efece4]">
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live demo card */}
        <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-[#d4cfc0] bg-white/70 backdrop-blur shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e8e4d8] bg-[#f5f3ee]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-2">Live input · English → French</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e8e4d8]">
            <div className="p-5 text-sm text-left leading-relaxed text-muted-foreground">
              "This agreement shall be governed by and construed in accordance with the laws of the State of California."
            </div>
            <div className="p-5 text-sm text-left leading-relaxed text-foreground bg-purple-50/50">
              "Le présent accord sera régi et interprété conformément aux lois de l'État de Californie."
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#e8e4d8] bg-[#f5f3ee]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">Consensus verified · 97.3%</span>
            </div>
            <span className="text-xs text-muted-foreground">Legal domain · 5 validators · On-chain ✓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
