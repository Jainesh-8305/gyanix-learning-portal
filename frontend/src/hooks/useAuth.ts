'use client';
import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
const subscribe = (callback: () => void) => {
  const a = useAuthStore.persist.onHydrate(callback);
  const b = useAuthStore.persist.onFinishHydration(callback);
  return () => {
    a();
    b();
  };
};
export function useAuthHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
export function dashboardFor(role?: string) {
  return role === 'admin'
    ? '/dashboard/admin'
    : role === 'instructor'
      ? '/dashboard/instructor'
      : '/dashboard/student';
}
