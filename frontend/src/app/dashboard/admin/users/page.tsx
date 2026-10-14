/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { Users, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const fetcher = (url: string) => api.get(url).then(r => r.data);

const ROLE_COLORS: Record<string, string> = {
  student: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  instructor: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  admin: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
};

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'admin') router.push('/dashboard/student');
  }, [isAuthenticated, user, router]);

  const { data, mutate, isLoading } = useSWR('/admin/users', fetcher);
  const users = data?.data || [];

  const handleToggle = async (userId: string, name: string) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      toast.success(`${name}'s account status updated`);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-[#05060f] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-teal-400 text-sm font-medium mb-2">
            <ShieldCheck size={14} /> User management
          </div>
          <h1 className="text-2xl font-semibold text-white">All Users</h1>
          <p className="text-indigo-200/50 mt-1">{users.length} registered users</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-[#0f1120]/60 border border-indigo-500/10 rounded-2xl h-16 animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-[#0f1120]/80 backdrop-blur-xl border border-indigo-500/15 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-indigo-500/10 text-xs font-medium text-indigo-200/40 uppercase tracking-wide">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
            </div>
            {users.map((u: any) => (
              <div key={u._id} className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-indigo-500/5 last:border-0 items-center hover:bg-white/2 transition">
                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                <p className="text-sm text-indigo-200/50 truncate">{u.email}</p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border w-fit capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.student}`}>
                  {u.role}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${u.isActive ? 'text-teal-400' : 'text-pink-400'}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggle(u._id, u.name)}
                      className={`transition ${u.isActive ? 'text-teal-400 hover:text-pink-400' : 'text-pink-400 hover:text-teal-400'}`}
                      title={u.isActive ? 'Disable user' : 'Enable user'}
                    >
                      {u.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}