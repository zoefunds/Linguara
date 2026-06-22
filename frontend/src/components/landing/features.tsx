'use client';
import { Brain, CheckCircle2, BarChart3, FileText, Scale, Wallet } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Consensus Engine',
    desc: 'Multiple independent GenLayer validators translate simultaneously. Consensus verifies meaning preservation before delivery.',
    accent: 'bg-purple-100 text-purple-700',
  },
  {
    icon: CheckCircle2,
    title: 'Semantic Verification',
    desc: 'Meaning, tone, cultural context, and domain accuracy validated by on-chain logic before every output.',
    accent: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: BarChart3,
    title: 'Confidence Scores',
    desc: 'Every translation ships with a cryptographically-backed trust score you can independently verify on-chain.',
    accent: 'bg-amber-100 text-amber-700',
  },
  {
    icon: FileText,
    title: 'Immutable Audit Trail',
    desc: 'Every translation decision recorded on GenLayer. Permanent, tamper-proof, verifiable by anyone.',
    accent: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Scale,
    title: 'Legal & Healthcare Ready',
    desc: 'Domain-specific prompting for contracts, medical records, government documents, and financial instruments.',
    accent: 'bg-red-100 text-red-700',
  },
  {
    icon: Wallet,
    title: 'Your Wallet, Your Identity',
    desc: 'Every account gets a unique Ethereum wallet. Your translation history is cryptographically yours.',
    accent: 'bg-cyan-100 text-cyan-700',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">Why Linguara</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Designed for Linguistic Excellence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Linguara combines decentralized AI with deep domain understanding to provide
            context-aware translations that feel natural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-[#d4cfc0] bg-[#efece4]/60 p-7 hover:bg-white/80 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className={`inline-flex p-3 rounded-xl ${f.accent} mb-5`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Document processing highlight */}
        <div className="mt-10 rounded-2xl border border-[#d4cfc0] bg-[#efece4]/60 p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-3">
            <div className={`inline-flex p-3 rounded-xl bg-indigo-100 text-indigo-700 mb-2`}>
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Document Processing</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Upload PDFs, Docs, or Spreadsheets and maintain their original layout and formatting
              while the text is perfectly translated.
            </p>
            <ul className="space-y-1.5">
              {['OCR Recognition', 'Layout Preservation', 'Multi-format Support'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 rounded-xl border border-[#d4cfc0] bg-white/70 p-6 text-sm text-muted-foreground space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e8e4d8]">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-foreground text-xs">contract_2025.pdf</p>
                <p className="text-xs text-muted-foreground">Legal · EN → FR · Processing...</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {['Article 1 — Definitions', 'Article 2 — Obligations', 'Article 3 — Jurisdiction'].map(a => (
                <div key={a} className="flex items-center justify-between text-xs">
                  <span>{a}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
