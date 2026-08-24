'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastContext';
import { Shield, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        if (data.data.devToken) {
          setDevToken(data.data.devToken);
        }
        success('Reset instructions generated');
      } else {
        error(data.error || 'Failed to submit request');
      }
    } catch {
      error('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-darkest flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md z-10">
        <div className="bg-luxury-card/90 border border-luxury-gold/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/70 shadow-xl shadow-luxury-gold/15 flex items-center justify-center overflow-hidden">
              <img
                src="/images/aureevo-logo.png"
                alt="AUREEVO Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold font-brand tracking-widest text-white">
              Password Recovery
            </h1>
            <p className="text-xs text-luxury-muted mt-1">
              Enter your registered administrator email to receive reset credentials.
            </p>
          </div>

          {isSubmitted ? (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-luxury-muted leading-relaxed">
                If the email <span className="text-white font-medium">{email}</span> matches an active admin account, a secure reset token has been issued.
              </p>

              {devToken && (
                <div className="p-4 rounded-xl bg-luxury-surface/50 border border-luxury-border text-left">
                  <p className="text-[11px] font-semibold text-luxury-gold mb-1">Development Mode Token:</p>
                  <p className="font-mono text-[10px] text-white break-all">{devToken}</p>
                </div>
              )}

              <Link href="/admin/login" className="block pt-2">
                <Button variant="emerald" size="md" className="w-full">
                  Return to Admin Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Admin Email"
                type="email"
                placeholder="admin@aureevo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Send Reset Token
              </Button>

              <div className="text-center pt-3">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-luxury-muted hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
