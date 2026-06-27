'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Languages, Clock, FileText, Shield, Wallet, Settings, BarChart3, LogOut, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: '/dashboard/translate', icon: Languages, label: 'Translate' },
  { href: '/dashboard/history', icon: Clock, label: 'History' },
  { href: '/dashboard/documents', icon: FileText, label: 'Documents' },
  { href: '/dashboard/audit', icon: Shield, label: 'Audit Trail' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Reports' },
  { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <button
        className="md:hidden p-2 rounded-xl border border-[#d4cfc0] bg-white/60 text-foreground"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 bg-[#e8e4d8] border-r border-[#d4cfc0] flex flex-col transition-transform duration-300 md:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-5 border-b border-[#d4cfc0]">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <img src="/logo.png" alt="Linguara" className="h-8 w-8 rounded-xl" />
            <span>Linguara</span>
          </Link>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/50">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname.endsWith(href) || pathname.includes(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : '')} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#d4cfc0]">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/50 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </>
  );
}
