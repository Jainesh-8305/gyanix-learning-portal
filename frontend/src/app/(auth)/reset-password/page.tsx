/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import AstroMascot from '@/components/ui/AstroMascot';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error('Invalid or expired password reset token.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-indigo-500/25">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <AstroMascot role="auth" className="w-24 h-24 sm:w-28 sm:h-28" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Gyanix Academy Security</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          Set New Password
        </h1>
        <p className="text-indigo-200/70 text-xs sm:text-sm">
          Create a strong password of at least 8 characters.
        </p>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-teal-400" />
            <h3 className="text-base font-bold text-white">Password Changed Successfully</h3>
            <p className="text-xs text-indigo-200/80">
              Redirecting you to the scholar login portal...
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glow-btn-primary text-xs font-semibold"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" suppressHydrationWarning>
          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2">
              New Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-indigo-300/50">
                <Lock className="w-5 h-5" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                suppressHydrationWarning
                className="w-full pl-12 pr-12 py-3.5 rounded-xl glass-input text-sm placeholder-indigo-300/30 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-indigo-300/50 hover:text-indigo-200 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1.5 pl-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-indigo-300/50">
                <Lock className="w-5 h-5" />
              </div>
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                suppressHydrationWarning
                className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm placeholder-indigo-300/30 focus:outline-none transition"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1.5 pl-1 font-medium">{errors.confirmPassword.message}</p>
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
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-[#05060f] overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <Suspense fallback={<div className="glass-card rounded-3xl p-12 text-center text-indigo-200/50">Loading security token...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
