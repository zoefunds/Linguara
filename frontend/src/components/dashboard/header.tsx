'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';

const titles: Record<string, string> = {
  '/dashboard/translate': 'Translation Workspace',
  '/dashboard/history': 'Translation History',
  '/dashboard/documents': 'Documents',
  '/dashboard/audit': 'Audit Trail',
  '/dashboard/reports': 'Reports',
  '/dashboard/wallet': 'Wallet',
  '/dashboard/settings': 'Settings',
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Globe className="h-5 w-5 text-primary" />
        </div>
        <h1 className="font-semibold">{titles[pathname] || 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="info" className="hidden sm:inline-flex capitalize text-xs">{user?.plan?.toLowerCase()}</Badge>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
