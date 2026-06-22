'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Languages, Clock, FileText, Shield, Wallet, Settings, BarChart3, LogOut } from 'lucide-react';
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

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="hidden md:flex w-60 border-r border-[#d4cfc0] bg-[#e8e4d8]/70 flex-col">
      <div className="p-5 border-b border-[#d4cfc0]">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <Globe className="h-5 w-5 text-primary" />
          <span>Linguara</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.endsWith(href) || pathname.includes(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
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
    </aside>
  );
}
