/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ShieldCheck, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function AdminEnrollmentsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'admin') router.push('/dashboard/student');
  }, [isAuthenticated, user, router]);

  const { data, isLoading } = useSWR('/admin/enrollments', fetcher);
  const enrollments = data?.data || [];

  return (
    <div className="min-h-screen bg-[#05060f] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-teal-400 text-sm font-medium mb-2">
            <ShieldCheck size={14} /> Enrollment records
          </div>
          <h1 className="text-2xl font-semibold text-white">All Enrollments</h1>
          <p className="text-indigo-200/50 mt-1">{enrollments.length} total enrollments</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-[#0f1120]/60 border border-indigo-500/10 rounded-2xl h-16 animate-pulse" />)}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-[#0f1120]/80 border border-indigo-500/15 rounded-2xl p-10 text-center">
            <ShoppingCart size={32} className="text-indigo-400/30 mx-auto mb-4" />
            <p className="text-white font-medium">No enrollments yet</p>
          </div>
        ) : (
          <div className="bg-[#0f1120]/80 backdrop-blur-xl border border-indigo-500/15 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-indigo-500/10 text-xs font-medium text-indigo-200/40 uppercase tracking-wide">
              <span>Student</span>
              <span>Course</span>
              <span>Progress</span>
              <span>Date</span>
            </div>
            {enrollments.map((e: any) => (
              <div key={e._id} className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-indigo-500/5 last:border-0 items-center hover:bg-white/2 transition">
                <p className="text-sm font-medium text-white truncate">{e.student?.name}</p>
                <p className="text-sm text-indigo-200/50 truncate">{e.course?.title}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-indigo-500 to-teal-400 rounded-full"
                      style={{ width: `${e.progressPercentage || 0}%` }} />
                  </div>
                  <span className="text-xs text-indigo-200/40">{e.progressPercentage || 0}%</span>
                </div>
                <p className="text-xs text-indigo-200/40">
                  {new Date(e.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}