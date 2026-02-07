"use client";

import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Theme } from "@radix-ui/themes";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/providers/AuthProvider";
import { useReaderStore } from "@/store/readerStore";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5min antes de considerar stale
        gcTime: 15 * 60 * 1000, // 15min no garbage collector
        retry: (failureCount, error) => {
          // Não retentar erros 404
          if (
            error instanceof Error &&
            (error.message.includes("não encontrado") ||
              error.message.includes("not found"))
          )
            return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        // Compartilhamento estrutural: evita re-renders quando
        // os dados são iguais após refetch
        structuralSharing: true,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  // Reidrata o store do localStorage APÓS a montagem no cliente.
  // Isso garante que a primeira renderização (hidratação) use o mesmo
  // locale padrão do servidor, evitando hydration mismatch.
  useEffect(() => {
    useReaderStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Theme
        appearance="inherit"
        accentColor="iris"
        grayColor="slate"
        radius="medium"
        scaling="100%"
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Theme>
    </ThemeProvider>
  );
}
