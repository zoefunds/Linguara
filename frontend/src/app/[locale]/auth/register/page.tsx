'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, Loader2, Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const wallet = await registerUser(data.email, data.password, data.fullName);
      setWalletAddress(wallet.address);
      setTimeout(() => router.push('/dashboard/translate'), 2500);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: err?.response?.data?.message || 'Could not create account',
      });
    }
  };

  if (walletAddress) {
    return (
      <div className="min-h-screen bg-[#efece4] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6 bg-white/70 border border-[#d4cfc0] rounded-2xl p-10 shadow-sm">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Account created!</h2>
            <p className="text-muted-foreground text-sm mt-1">Your blockchain wallet has been generated</p>
          </div>
          <div className="bg-[#efece4] rounded-xl border border-[#d4cfc0] p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Wallet address</p>
            <p className="font-mono text-xs break-all text-foreground">{walletAddress}</p>
          </div>
          <p className="text-xs text-muted-foreground">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efece4] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-[#efece4] flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Globe className="h-6 w-6 text-primary" />
          <span>Linguara</span>
        </Link>
        <div className="space-y-6">
          <p className="text-4xl font-bold leading-tight">
            Join thousands<br />translating with<br />on-chain proof.
          </p>
          <ul className="space-y-3 text-sm text-[#efece4]/70">
            {[
              'Free forever — no credit card',
              'Auto-generated blockchain wallet',
              '70+ languages supported',
              'Immutable audit trail for every job',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 text-sm text-[#efece4]/60">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Secured by GenLayer Intelligent Contracts
          </div>
        </div>
        <p className="text-xs text-[#efece4]/40">© 2025 Linguara AI. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-7">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground text-sm">Free forever · No credit card required</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                placeholder="Jane Smith"
                className="bg-white/70 border-[#d4cfc0] rounded-xl h-11"
                {...register('fullName')}
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-white/70 border-[#d4cfc0] rounded-xl h-11"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                className="bg-white/70 border-[#d4cfc0] rounded-xl h-11"
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="bg-white/70 border-[#d4cfc0] rounded-xl h-11"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-[#d4cfc0] bg-white/60 p-3">
              <Wallet className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">A blockchain wallet will be auto-generated for your account</p>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full h-11"
              variant="gradient"
              size="lg"
              disabled={isLoading}
            >
              {isLoading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                : 'Create account'}
            </Button>
          </form>

          <div className="space-y-3 text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
