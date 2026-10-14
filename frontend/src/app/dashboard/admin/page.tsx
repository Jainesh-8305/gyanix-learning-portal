'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Users, BookOpen, ShoppingCart, Clock, ShieldCheck, IndianRupee, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    pendingCourses: 0,
    revenueThisMonth: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.token) return;
        }
      } catch (e) {}
    }
    if (!isAuthenticated) router.push('/login');
    else if (user?.role && user.role !== 'admin') router.push(`/dashboard/${user.role}`);
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      accent: 'from-indigo-500 to-indigo-600',
      href: '/dashboard/admin/users',
      hint: 'Manage accounts →',
    },
    {
      label: 'Course Governance',
      value: stats.totalCourses,
      icon: BookOpen,
      accent: 'from-teal-500 to-indigo-600',
      href: '/dashboard/admin/courses',
      hint: 'Manage & moderate →',
    },
    {
      label: 'Enrollments',
      value: stats.totalEnrollments,
      icon: ShoppingCart,
      accent: 'from-amber-500 to-orange-500',
      href: '/dashboard/admin/enrollments',
      hint: 'View transactions →',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingCourses,
      icon: Clock,
      accent: 'from-pink-500 to-rose-600',
      href: '/dashboard/admin/courses?status=pending',
      hint: 'Review submissions →',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Overview</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Command Deck</h1>
          <p className="text-sm text-indigo-200/60 mt-1">
            System health, course governance, user management, and revenue monitoring.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="glass-card rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 group cursor-pointer block border border-indigo-500/20 hover:border-indigo-500/40"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.accent} flex items-center justify-center mb-4 text-white shadow-lg`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold text-white">{card.value}</p>
                <p className="text-sm text-indigo-200/70 font-medium mt-1">{card.label}</p>
                <p className="text-xs text-teal-400/70 group-hover:text-teal-300 mt-2 transition-colors font-medium">
                  {card.hint}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Revenue Card & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-indigo-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300/60 mb-2">
                <IndianRupee className="w-4 h-4 text-teal-400" />
                <span>Gross Revenue (Last 30 Days)</span>
              </div>
              <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-200 via-teal-200 to-teal-400 bg-clip-text text-transparent mt-2">
                ₹{stats.revenueThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="pt-6 border-t border-indigo-500/15 mt-6 flex flex-wrap gap-4">
              <Link
                href="/dashboard/admin/courses"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glow-btn-primary text-xs font-semibold transition"
              >
                <span>Moderate Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/admin/users"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-indigo-500/25 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 hover:text-white transition"
              >
                <Users className="w-4 h-4 text-teal-400" />
                <span>Manage Users & Roles</span>
              </Link>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-indigo-500/20 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Moderation Queue</h3>
              <p className="text-xs text-indigo-200/60 leading-relaxed">
                You have{' '}
                <strong className="text-amber-300 font-bold">{stats.pendingCourses}</strong> courses
                waiting for admin approval or review.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/dashboard/admin/courses?status=pending"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl glow-btn-teal text-xs font-semibold transition"
              >
                <Clock className="w-4 h-4" />
                <span>Review Pending Courses</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}