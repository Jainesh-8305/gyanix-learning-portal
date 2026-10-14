'use client';

import { SWRConfig } from 'swr';
import api from '@/lib/api';

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => api.get(url).then((res) => res.data),
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: true,
        dedupingInterval: 10000, // Cache for 10s for instant snappy page transitions
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
