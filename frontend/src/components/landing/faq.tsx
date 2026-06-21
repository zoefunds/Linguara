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
