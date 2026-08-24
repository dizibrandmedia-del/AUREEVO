'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { ArrowRight } from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password }),
      });

      const data = await res.json();
      if (data.success) {
        success('Account created', `Welcome to AUREEVO, ${data.data.user.firstName}`);
        router.push('/');
        router.refresh();
      } else {
        error(data.error || 'Registration failed');
      }
    } catch {
      error('Network error during registration');
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
              Join The World of Luxury
            </p>
          </Link>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name *"
                placeholder="Eleanor"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name *"
                placeholder="Vane"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address *"
              type="email"
              placeholder="eleanor@luxury.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Password (min 8 characters) *"
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
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-luxury-border/60 text-xs text-luxury-muted">
            <span>Already have an account? </span>
            <Link href="/auth/login" className="text-luxury-gold-light hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
