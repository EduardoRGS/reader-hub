'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useMemo, useState } from 'react';

function isHttpClientError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const maybeWithResponse = error as { response?: unknown };
  if (!('response' in maybeWithResponse)) return false;
  const response = maybeWithResponse.response as unknown;
  if (typeof response !== 'object' || response === null) return false;
  const maybeStatus = (response as { status?: unknown }).status;
  return typeof maybeStatus === 'number' && maybeStatus >= 400 && maybeStatus < 500;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            gcTime: 10 * 60 * 1000, // 10 minutos
            retry: (failureCount, error) => {
              if (isHttpClientError(error)) {
                return false;
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  const isBrowser = typeof window !== 'undefined';
  const persister = useMemo(
    () => (isBrowser ? createSyncStoragePersister({ storage: window.localStorage }) : undefined),
    [isBrowser]
  );

  if (!isBrowser || !persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            if (query.state.status !== 'success') return false;
            const key = query.queryKey as readonly unknown[];
            const root = Array.isArray(key) ? String(key[0]) : '';
            // Evitar persistir dados potencialmente grandes
            if (root === 'chapter' || root === 'chapters' || root === 'manga-cover') {
              return false;
            }
            return true;
          },
        },
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}