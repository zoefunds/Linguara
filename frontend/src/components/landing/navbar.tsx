'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-[#efece4]/95 backdrop-blur border-b border-[#d4cfc0] shadow-sm'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Linguara" className="h-8 w-8 rounded-xl" />
            <span className="font-bold text-lg tracking-tight">Linguara</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 transition-colors">
              Log in
            </Link>
            <Link href="/auth/register" className="text-sm font-semibold bg-foreground text-[#efece4] px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
              Get started
            </Link>
          </div>

          <button className="md:hidden p-1" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#d4cfc0] bg-[#efece4]/98 backdrop-blur px-6 py-5 space-y-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="block text-sm py-1.5 text-muted-foreground hover:text-foreground font-medium" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-[#d4cfc0]">
            <Link href="/auth/login" className="text-center text-sm font-medium border border-[#d4cfc0] rounded-full py-2.5 hover:bg-[#e8e4d8] transition-colors">Log in</Link>
            <Link href="/auth/register" className="text-center text-sm font-semibold bg-foreground text-[#efece4] rounded-full py-2.5 hover:opacity-90 transition-opacity">Get started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
