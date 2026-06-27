'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { User, Bell, Globe, Shield } from 'lucide-react';

const LOCALES = [
  { code: 'en', name: 'English' }, { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }, { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' }, { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' }, { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }, { code: 'ru', name: 'Русский' },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [lang, setLang] = useState(user?.preferredLanguage || 'en');

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/auth/me', { fullName: name, preferredLanguage: lang });
      toast({ title: 'Settings saved' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg"><User className="h-5 w-5 text-primary" /></div>
            <div><CardTitle>Profile</CardTitle><CardDescription>Update your personal information</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email address</Label>
            <Input value={user?.email || ''} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label>Preferred language</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} variant="gradient" disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg"><Shield className="h-5 w-5 text-primary" /></div>
            <div><CardTitle>Account</CardTitle><CardDescription>Plan and account details</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current plan</p>
              <p className="text-sm text-muted-foreground">Your active subscription</p>
            </div>
            <Badge variant="info" className="capitalize">{user?.plan?.toLowerCase()}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email verification</p>
              <p className="text-sm text-muted-foreground">Account email status</p>
            </div>
            <Badge variant={user?.emailVerified ? 'success' : 'warning'}>
              {user?.emailVerified ? 'Verified' : 'Pending'}
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
