import { create } from "zustand";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;

  // Actions
  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Store de autenticação.
 * 
 * IMPORTANTE: O accessToken é armazenado apenas em memória (não persistido).
 * O refreshToken é gerenciado via HttpOnly cookie pelo backend.
 * Ao recarregar a página, o frontend tenta renovar o token via /api/auth/refresh.
 * 
 * Para dados derivados (isAuthenticated, isAdmin), use selectors inline:
 *   const isAuthenticated = useAuthStore((s) => s.user !== null && s.accessToken !== null);
 *   const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");
 */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isLoading: true, // Começa true até verificar a sessão

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isLoading: false }),

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
