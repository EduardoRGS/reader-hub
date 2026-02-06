"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { Theme } from "@radix-ui/themes";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Theme>
    </ThemeProvider>
  );
}
