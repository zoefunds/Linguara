'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Globe, Languages, Clock, FileText, Shield, Wallet, Settings, BarChart3, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
    <aside className="hidden md:flex w-60 border-r border-border bg-card/50 flex-col">
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Globe className="h-5 w-5 text-primary" />
          <span>Linguara</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.endsWith(href) || pathname.includes(href + '/')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-3">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-foreground truncate">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
