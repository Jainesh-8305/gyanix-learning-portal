'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Sparkles,
  GraduationCap,
  Presentation,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['student', 'instructor']),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectMap: Record<string, string> = {
        admin: '/dashboard/admin',
        instructor: '/dashboard/instructor',
        student: '/dashboard/student',
      };
      router.replace(redirectMap[user.role] || '/dashboard/student');
    }
  }, [isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      setAuth(res.data.user, res.data.token);
      toast.success(
        'Welcome to Gyanix Academy! Your academic journey begins now.',
      );
      router.push(
        data.role === 'instructor'
          ? '/dashboard/instructor'
          : '/dashboard/student',
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg =
        err?.response?.data?.message ??
        (error instanceof Error ? error.message : 'Registration failed');

      if (
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        toast.error(
          'An account with this email already exists. Redirecting to login…',
        );
        setTimeout(() => router.push('/login'), 1500);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-[#05060f] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-500/12 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-indigo-500/25">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 via-indigo-500 to-indigo-600 p-0.5 shadow-lg shadow-teal-500/20 mb-3 animate-float">
              <div className="w-full h-full bg-[#0a0c1a] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-teal-300" />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gyanix Academy Enrollment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
              Create Scholar Account
            </h1>
            <p className="text-indigo-200/70 text-xs sm:text-sm">
              Join the world’s leading AI education & certification ecosystem
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            suppressHydrationWarning
          >
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2.5">
                Select Academic Role
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  {
                    value: 'student',
                    label: 'Student Scholar',
                    sub: 'Learn & earn certs',
                    Icon: GraduationCap,
                  },
                  {
                    value: 'instructor',
                    label: 'Faculty Mentor',
                    sub: 'Publish & instruct',
                    Icon: Presentation,
                  },
                ].map(({ value, label, sub, Icon }) => {
                  const isSelected = selectedRole === value;
                  return (
                    <label
                      key={value}
                      className={`relative flex flex-col items-center text-center cursor-pointer rounded-2xl p-4 transition-all border ${
                        isSelected
                          ? 'border-teal-400 bg-teal-500/10 shadow-lg shadow-teal-500/15'
                          : 'border-indigo-400/20 bg-white/5 hover:border-indigo-400/40 hover:bg-white/8'
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        {...register('role')}
                        id="register-role"
                        aria-label="role"
                        className="sr-only"
                      />
                      <Icon
                        className={`w-6 h-6 mb-2 transition-colors ${
                          isSelected ? 'text-teal-300' : 'text-indigo-300/50'
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-indigo-100/80'}`}
                      >
                        {label}
                      </span>
                      <span className="text-[11px] text-indigo-300/50 mt-0.5">
                        {sub}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-1.5">
                Full Name (Printed on certificates)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-indigo-300/50">
                  <User className="w-5 h-5" />
                </div>
                <input
                  {...register('name')}
                  id="register-name"
                  aria-label="Full name"
                  placeholder="e.g. Darshil Baladhiya"
                  suppressHydrationWarning
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm placeholder-indigo-300/30 focus:outline-none transition"
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-xs mt-1.5 pl-1 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-indigo-300/50">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  {...register('email')}
                  id="register-email"
                  aria-label="email"
                  type="email"
                  placeholder="scholar@aetheris.edu"
                  suppressHydrationWarning
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm placeholder-indigo-300/30 focus:outline-none transition"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 pl-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-indigo-300/50">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('password')}
                  id="register-password"
                  aria-label="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  suppressHydrationWarning
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl glass-input text-sm placeholder-indigo-300/30 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-indigo-300/50 hover:text-indigo-200 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 pl-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-indigo-300/50">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('confirmPassword')}
                  id="register-confirmPassword"
                  aria-label="Confirm password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  suppressHydrationWarning
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl glass-input text-sm placeholder-indigo-300/30 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 text-indigo-300/50 hover:text-indigo-200 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5 pl-1 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl glow-btn-teal font-semibold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enrolling Scholar...</span>
                </>
              ) : (
                <>
                  <span>Create Scholar Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-indigo-500/15 text-center">
            <p className="text-indigo-200/60 text-sm">
              Already enrolled in Gyanix Academy?{' '}
              <Link
                href="/login"
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors inline-flex items-center gap-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
