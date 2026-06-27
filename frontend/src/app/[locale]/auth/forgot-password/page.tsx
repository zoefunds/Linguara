'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-[#1a1814] flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Linguara" width={32} height={32} className="rounded-lg" />
          <span className="text-white text-xl font-bold">Linguara</span>
        </Link>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">Reset your password</h2>
          <p className="text-[#a09880] text-lg">We'll send a secure link to your inbox so you can get back in.</p>
        </div>
        <p className="text-[#6b6456] text-sm">Linguara · AI-powered translation on GenLayer</p>
      </div>

      <div className="flex-1 bg-[#efece4] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Linguara" width={28} height={28} className="rounded-lg" />
              <span className="text-[#1a1814] text-xl font-bold">Linguara</span>
            </Link>
          </div>

          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#d4cfc0] flex items-center justify-center mx-auto shadow-sm">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a1814]">Check your inbox</h1>
                <p className="text-[#6b6456] mt-2">If that email is registered, a reset link has been sent.</p>
              </div>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full rounded-full border-[#d4cfc0] bg-white/70 hover:bg-white gap-2">
                  <ArrowLeft className="h-4 w-4" />Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-[#1a1814]">Forgot password?</h1>
                <p className="text-[#6b6456] mt-1">Enter your email and we'll send a reset link.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#1a1814] font-medium">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-full bg-white/70 border-[#d4cfc0] h-12 px-5 focus:border-primary focus:ring-primary"
                    {...register('email', { required: true })}
                  />
                </div>

                <Button type="submit" variant="gradient" className="w-full rounded-full h-12 text-base" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send reset link'}
                </Button>

                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full rounded-full text-[#6b6456] hover:text-[#1a1814] gap-2">
                    <ArrowLeft className="h-4 w-4" />Back to login
                  </Button>
                </Link>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
