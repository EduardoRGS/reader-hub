"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/api";

/**
 * Provider de autenticação.
 * Tenta restaurar a sessão do usuário ao carregar a página
 * usando o refresh token armazenado no cookie HttpOnly.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession() {
      try {
        const data = await authService.refresh();
        if (!controller.signal.aborted) {
          setAuth(data.user, data.access_token);
        }
      } catch {
        if (!controller.signal.aborted) {
          clearAuth();
        }
      }
    }

    restoreSession();

    return () => {
      controller.abort();
    };
  }, [setAuth, clearAuth]);

  return <>{children}</>;
}
