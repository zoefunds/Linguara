'use client';

const steps = [
  { n: '01', title: 'Submit content', desc: 'Paste text or upload a document (PDF, DOCX, TXT). Auto-detects the source language.' },
  { n: '02', title: 'Validators translate', desc: '5 independent GenLayer AI validators translate in parallel using your chosen domain and tone.' },
  { n: '03', title: 'Consensus reached', desc: 'The equivalence principle verifies all validators agree on meaning, tone, and accuracy.' },
  { n: '04', title: 'Verified delivery', desc: 'Receive the translation with a confidence score and immutable on-chain verification hash.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#efece4]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">Process</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">How Linguara works</h2>
          <p className="text-lg text-muted-foreground">From submission to verified translation in under 90 seconds</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-[#d4cfc0] bg-white/60 p-7 space-y-4 hover:shadow-md transition-shadow">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px bg-[#d4cfc0] z-10" />
              )}
              <div className="w-12 h-12 rounded-full bg-foreground text-[#efece4] flex items-center justify-center font-bold text-sm">
                {s.n}
              </div>
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
