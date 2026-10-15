'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthHydrated, dashboardFor } from '@/hooks/useAuth';
export default function AuthBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const ready = useAuthHydrated();
  const { user, token, isAuthenticated } = useAuthStore();
  const protectedRoute =
    /^\/(dashboard|profile|help)(\/|$)/.test(path) ||
    /^\/courses\/[^/]+\/(learn|community|quiz)(\/|$)/.test(path);
  const role = path.match(
    /^\/dashboard\/(admin|instructor|student)(\/|$)/,
  )?.[1];
  const { data, error } = useSWR(
    ready && token && protectedRoute ? ['session', token] : null,
    () => api.get('/auth/me').then((r) => r.data),
    { revalidateOnFocus: true },
  );
  const allowed = !role || role === user?.role;
  useEffect(() => {
    if (!ready || !protectedRoute) return;
    if (!isAuthenticated || !token || error)
      router.replace(
        '/login?redirect=' + encodeURIComponent(path + window.location.search),
      );
    else if (!allowed) router.replace(dashboardFor(user?.role));
  }, [
    ready,
    protectedRoute,
    isAuthenticated,
    token,
    error,
    allowed,
    user?.role,
    path,
    router,
  ]);
  if (
    protectedRoute &&
    (!ready || !isAuthenticated || !allowed || !data || error)
  )
    return (
      <main className="p-12 text-center text-indigo-100" role="status">
        Checking your session...
      </main>
    );
  return children;
}
