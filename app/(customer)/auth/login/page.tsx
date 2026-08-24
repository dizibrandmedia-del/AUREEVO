'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { ArrowRight, User } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('Customer@123456');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        success('Welcome back', `Signed in as ${data.data.user.firstName}`);
        router.push('/');
        router.refresh();
      } else {
        error(data.error || 'Authentication failed');
      }
    } catch {
      error('Network error during customer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-darkest flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-luxury-card/90 border border-luxury-gold/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center">
          <Link href="/" className="inline-block mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/70 flex items-center justify-center overflow-hidden shadow-xl shadow-luxury-gold/15">
              <img src="/images/aureevo-logo.png" alt="AUREEVO" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold font-brand tracking-widest text-white mt-3">AUREEVO</h1>
            <p className="text-[9px] uppercase tracking-[0.25em] text-luxury-gold-light">
              Clientèle Concierge Access
            </p>
          </Link>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <Input
              label="Email Address"
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Access Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-luxury-border/60 text-xs text-luxury-muted">
            <span>New to AUREEVO? </span>
            <Link href="/auth/register" className="text-luxury-gold-light hover:underline font-semibold">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
