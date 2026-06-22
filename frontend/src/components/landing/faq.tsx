'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'What makes Linguara different from Google Translate or DeepL?', a: 'Linguara uses GenLayer Intelligent Contracts to coordinate multiple independent AI validators that each produce a translation. A consensus mechanism verifies semantic equivalence on-chain. The result is a cryptographically-backed confidence score and an immutable audit trail — something no centralized service can provide.' },
  { q: 'What is the GenLayer consensus mechanism?', a: "GenLayer is a blockchain platform that supports non-deterministic computation. Linguara's Intelligent Contract runs 5 independent LLM-based validators in parallel, reaches consensus on meaning, and stores the verification result on-chain permanently." },
  { q: 'How accurate are the translations?', a: 'Our consensus approach consistently achieves 90–97% confidence. The confidence score tells you exactly how much to trust each translation, and you can verify the on-chain receipt independently.' },
  { q: 'What languages are supported?', a: 'Linguara supports 70+ languages including all major world languages, regional scripts, and right-to-left scripts such as Arabic, Hebrew, Urdu, and Persian.' },
  { q: 'Can I translate documents?', a: 'Yes. You can upload PDF, DOCX, and TXT files. The text is extracted, translated with context awareness, and the result is returned maintaining the document structure.' },
  { q: 'Is my content stored permanently?', a: 'Source and translated text are stored securely in our database. The verification metadata (confidence scores, consensus result, tx hash) is stored on-chain via GenLayer for permanent verifiability.' },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 bg-[#efece4]">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">FAQ</p>
          <h2 className="text-4xl font-bold text-foreground">Frequently asked questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border border-[#d4cfc0] bg-white/60 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-6 text-left font-medium text-foreground hover:bg-white/80 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="pr-4 text-sm">{f.q}</span>
                {open === i
                  ? <Minus className="h-4 w-4 text-primary shrink-0" />
                  : <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                }
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-[#e8e4d8] pt-4">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
