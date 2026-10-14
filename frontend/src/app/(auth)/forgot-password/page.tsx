/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react';
import api from '@/lib/api';
import AstroMascot from '@/components/ui/AstroMascot';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
      if (res.data.resetUrl) {
        setDevResetUrl(res.data.resetUrl);
      }
      toast.success('Password reset link generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-[#05060f] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-indigo-500/25">
          {/* Mascot / Insignia */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <AstroMascot role="auth" className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Gyanix Academy Security</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Reset Password
            </h1>
            <p className="text-indigo-200/70 text-xs sm:text-sm">
              Enter your email and we&apos;ll send you a secure password reset link.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-teal-400" />
                <h3 className="text-base font-bold text-white">Reset Link Sent</h3>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  We sent a verified reset link to <strong className="text-white">{submittedEmail}</strong>. Check your inbox or click below.
                </p>
              </div>

              {devResetUrl && (
                <div className="p-4 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-left space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                    Direct Reset Link
                  </p>
                  <Link
                    href={devResetUrl}
                    className="block py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center transition"
                  >
                    Open Password Reset Page →
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Scholar Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2">
                  Account Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 pointer-events-none text-indigo-300/50">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="scholar@gyanix.edu"
                    suppressHydrationWarning
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm placeholder-indigo-300/30 focus:outline-none transition"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-2 pl-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                suppressHydrationWarning
                className="w-full py-4 px-6 rounded-xl glow-btn-primary font-semibold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200/70 hover:text-white transition"
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
