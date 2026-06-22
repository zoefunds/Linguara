'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for individuals getting started',
    features: ['50 translations / month', 'Text translation only', 'Basic confidence scores', 'Email support'],
    cta: 'Get started free',
    href: '/auth/register',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For professionals and growing teams',
    features: ['Unlimited translations', 'Document & file upload', 'Advanced audit trail', 'All 10 domains', 'Priority consensus', 'API access'],
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
    <section id="pricing" className="py-24 bg-white/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">Pricing</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground">No hidden fees. No surprise charges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-8 flex flex-col gap-6 transition-shadow hover:shadow-lg ${
                p.popular
                  ? 'border-primary bg-white shadow-xl shadow-primary/10'
                  : 'border-[#d4cfc0] bg-[#efece4]/60'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{p.description}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">{p.price}</span>
                  <span className="text-muted-foreground mb-1 text-sm">{p.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={`block text-center font-semibold py-3 rounded-full text-sm transition-opacity hover:opacity-90 ${
                  p.popular
                    ? 'bg-foreground text-[#efece4]'
                    : 'border border-[#d4cfc0] bg-white/60 text-foreground hover:bg-white'
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
