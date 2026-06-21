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
