import Link from 'next/link';
import { Globe } from 'lucide-react';

const links = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Case Studies', href: '#' },
    { label: 'Global Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#d4cfc0] bg-[#e8e4d8]/60 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
              <Globe className="h-5 w-5 text-primary" />
              <span>Linguara</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Advanced AI linguistics platform dedicated to dissolving the barriers between human
              understanding and technological possibility.
            </p>
            <p className="text-xs text-muted-foreground">Powered by GenLayer · StudioNet</p>
            <div className="flex gap-3 pt-1">
              {['𝕏', 'in', '@'].map(icon => (
                <div key={icon} className="w-8 h-8 rounded-full border border-[#d4cfc0] bg-white/60 flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:bg-white transition-colors">
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section} className="space-y-4">
              <h4 className="font-semibold text-sm text-foreground">{section}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#d4cfc0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Linguara AI. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-muted-foreground">System Operational</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
