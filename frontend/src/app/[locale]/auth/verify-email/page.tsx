'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-[#1a1814] flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Linguara" width={32} height={32} className="rounded-lg" />
          <span className="text-white text-xl font-bold">Linguara</span>
        </Link>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">Email verification</h2>
          <p className="text-[#a09880] text-lg">Confirming your identity to keep your account secure.</p>
        </div>
        <p className="text-[#6b6456] text-sm">Linguara · AI-powered translation on GenLayer</p>
      </div>

      <div className="flex-1 bg-[#efece4] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Linguara" width={28} height={28} className="rounded-lg" />
              <span className="text-[#1a1814] text-xl font-bold">Linguara</span>
            </Link>
          </div>

          {status === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#d4cfc0] flex items-center justify-center mx-auto shadow-sm">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a1814]">Verifying your email…</h1>
                <p className="text-[#6b6456] mt-2">Just a moment.</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a1814]">Email verified!</h1>
                <p className="text-[#6b6456] mt-2">Your account is now active. You can sign in.</p>
              </div>
              <Link href="/auth/login">
                <Button variant="gradient" className="rounded-full h-12 px-8">Go to login</Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a1814]">Verification failed</h1>
                <p className="text-[#6b6456] mt-2">The link may have expired or already been used.</p>
              </div>
              <Link href="/auth/login">
                <Button variant="outline" className="rounded-full h-12 px-8 border-[#d4cfc0] bg-white/70 hover:bg-white">
                  Back to login
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
