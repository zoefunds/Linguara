'use client';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { MobileSidebar } from './mobile-sidebar';

const titles: Record<string, string> = {
  translate: 'Translation Workspace',
  history: 'Translation History',
  id: 'Translation Details',
  documents: 'Documents',
  glossary: 'Glossary',
  audit: 'Audit Trail',
  reports: 'Reports',
  wallet: 'Wallet',
  settings: 'Settings',
};

export function DashboardHeader() {
  const pathname = usePathname();
  const segment = pathname.split('/dashboard/')[1]?.split('/')[0] ?? '';
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-[#d4cfc0] bg-[#efece4]/95 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <h1 className="font-semibold text-foreground">{titles[segment] || 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-3">
        {user?.plan && (
          <Badge variant="info" className="hidden sm:inline-flex capitalize text-xs">
            {user.plan.toLowerCase()}
          </Badge>
        )}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
