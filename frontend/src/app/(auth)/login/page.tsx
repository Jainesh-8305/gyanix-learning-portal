/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import AstroMascot from '@/components/ui/AstroMascot';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const numStars = 120;
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.3,
      speed: Math.random() * 0.012 + 0.004,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.phase += star.speed;
        const opacity = 0.2 + 0.7 * Math.abs(Math.sin(star.phase));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${opacity})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (isAuthenticated && user) {
      const redirectMap: Record<string, string> = {
        admin: '/dashboard/admin',
        instructor: '/dashboard/instructor',
        student: '/dashboard/student',
      };
      const target = new URLSearchParams(window.location.search).get(
        'redirect',
      );
      router.replace(
        target?.startsWith('/') &&
          !target.startsWith('//') &&
          !target.includes('\\') &&
          !target.startsWith('/login') &&
          !target.startsWith('/register')
          ? target
          : redirectMap[user.role] || '/dashboard/student',
      );
    }
  }, [isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const destination = (role: string) => {
    const target = new URLSearchParams(window.location.search).get('redirect');
    return target?.startsWith('/') &&
      !target.startsWith('//') &&
      !target.includes('\\') &&
      !target.startsWith('/login') &&
      !target.startsWith('/register')
      ? target
      : {
          admin: '/dashboard/admin',
          instructor: '/dashboard/instructor',
          student: '/dashboard/student',
        }[role] || '/dashboard/student';
  };
  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { user, token } = res.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(destination(user.role));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Login failed. Please check your credentials.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-[#05060f] overflow-hidden"
      suppressHydrationWarning
    >
      <StarfieldBackground />

      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      <div
        className="relative z-10 w-full max-w-md mx-auto"
        suppressHydrationWarning
      >
        {/* Main Glass Card */}
        <div
          className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-indigo-500/25"
          suppressHydrationWarning
        >
          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <AstroMascot role="auth" className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gyanix Scholar Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-indigo-200/70 text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Access your executive learning portal
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            suppressHydrationWarning
          >
            {/* Email Field */}
            <div suppressHydrationWarning>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2"
              >
                Email Address
              </label>
              <div
                className="relative flex items-center"
                suppressHydrationWarning
              >
                <div className="absolute left-4 pointer-events-none text-indigo-300/50">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  {...register('email')}
                  id="login-email"
                  autoComplete="email"
                  aria-describedby="login-email-error"
                  aria-invalid={!!errors.email}
                  type="email"
                  placeholder="scholar@aetheris.edu"
                  suppressHydrationWarning
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm placeholder-indigo-300/30 focus:outline-none transition"
                />
              </div>
              {errors.email && (
                <p
                  id="login-email-error"
                  role="alert"
                  className="text-red-400 text-xs mt-2 pl-1 font-medium"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div suppressHydrationWarning>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div
                className="relative flex items-center"
                suppressHydrationWarning
              >
                <div className="absolute left-4 pointer-events-none text-indigo-300/50">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('password')}
                  id="login-password"
                  autoComplete="current-password"
                  aria-describedby="login-password-error"
                  aria-invalid={!!errors.password}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  suppressHydrationWarning
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl glass-input text-sm placeholder-indigo-300/30 focus:outline-none transition"
                />
                {hasMounted && (
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-indigo-300/50 hover:text-indigo-200 transition-colors focus:outline-none cursor-pointer"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
              {errors.password && (
                <p
                  id="login-password-error"
                  role="alert"
                  className="text-red-400 text-xs mt-2 pl-1 font-medium"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full py-4 px-6 rounded-xl glow-btn-primary font-semibold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-indigo-500/15 text-center">
            <p className="text-indigo-200/60 text-sm">
              New to Gyanix Academy?{' '}
              <Link
                href="/register"
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors inline-flex items-center gap-1"
              >
                Create a scholar account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
