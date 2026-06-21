'use client';
import { useState } from 'react';
import { Wallet, Eye, EyeOff, Copy, Check, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function WalletPage() {
  const { user } = useAuthStore();
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addrCopied, setAddrCopied] = useState(false);

  const handleExport = async () => {
    if (!password) { toast({ variant: 'destructive', title: 'Enter your password' }); return; }
    setLoading(true);
    try {
      const { data } = await authApi.exportKey(password);
      setPrivateKey(data.data.privateKey);
      toast({ title: 'Private key exported', description: 'Store it securely and never share it.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export failed', description: err?.response?.data?.message || 'Invalid password' });
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.wallet?.address || '');
    setAddrCopied(true);
    setTimeout(() => setAddrCopied(false), 2000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(privateKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-lg"><Wallet className="h-5 w-5 text-indigo-400" /></div>
            <div>
              <CardTitle>Your Blockchain Wallet</CardTitle>
              <CardDescription>Auto-generated Ethereum wallet tied to your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Wallet address</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-muted/50 px-3 py-2.5 rounded-lg border border-border break-all">
                {user?.wallet?.address || 'Loading...'}
              </code>
              <Button variant="outline" size="icon" onClick={copyAddress}>
                {addrCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>This wallet is permanently associated with your Linguara account</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
            <div>
              <CardTitle>Export Private Key</CardTitle>
              <CardDescription>Password confirmation required. Never share your private key.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
            <p className="font-semibold">Security warning</p>
            <p className="text-xs">Anyone with your private key has full control of your wallet. Store it offline in a secure location.</p>
          </div>

          {!privateKey ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Confirm your password</Label>
                <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button onClick={handleExport} variant="outline" disabled={loading} className="gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10">
                {loading ? 'Verifying...' : 'Export private key'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Private key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted/50 px-3 py-2.5 rounded-lg border border-border break-all">
                  {showKey ? privateKey : '•'.repeat(64)}
                </code>
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={copyKey}>
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setPrivateKey(''); setPassword(''); }} className="text-muted-foreground">
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
