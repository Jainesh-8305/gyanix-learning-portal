'use client';

import { SWRConfig } from 'swr';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

export default function SWRProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = useAuthStore((s) => s.user?._id || 'guest');
  return (
    <SWRConfig
      key={identity}
      value={{
        provider: () => new Map(),
        fetcher: (url: string) => api.get(url).then((res) => res.data),
        revalidateOnFocus: true,
        focusThrottleInterval: 30000,
        revalidateIfStale: true,
        revalidateOnReconnect: true,
        dedupingInterval: 10000, // Cache for 10s for instant snappy page transitions
        keepPreviousData: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
