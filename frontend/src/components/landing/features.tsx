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
