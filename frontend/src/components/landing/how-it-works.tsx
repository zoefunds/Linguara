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
