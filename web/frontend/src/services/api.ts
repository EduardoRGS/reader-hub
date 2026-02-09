import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  Manga,
  Chapter,
  PaginatedResponse,
  BackendChapterResponseDto,
  PopulationStats,
  PopulationResult,
} from "@/types/manga";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Enviar cookies (refresh_token) automaticamente
});

// ─── Request interceptor: adicionar access token ────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: retry + refresh token ────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const req = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _authRetry?: boolean;
    };

    // Retry para erros de rede
    if (
      (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") &&
      req &&
      !req._retry
    ) {
      req._retry = true;
      await new Promise((r) => setTimeout(r, 1000));
      return api.request(req);
    }

    // Refresh token em caso de 401 (exceto endpoints de auth)
    if (
      error.response?.status === 401 &&
      req &&
      !req._authRetry &&
      !req.url?.includes("/api/auth/")
    ) {
      if (isRefreshing) {
        // Se já está fazendo refresh, enfileirar
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token) req.headers.Authorization = `Bearer ${token}`;
              resolve(api.request(req));
            },
            reject,
          });
        });
      }

      req._authRetry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<AuthResponse>(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.access_token;
        useAuthStore.getState().setAuth(data.user, newToken);

        req.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        return api.request(req);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Trata erros da API com mensagens em inglês (fallback universal).
 * Os componentes da UI podem traduzir usando o sistema i18n quando necessário.
 */
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const serverMessage = data?.details || data?.message;

    if (error.code === "ECONNABORTED")
      throw new Error("Request timed out. Please try again.");
    if (error.code === "ERR_NETWORK")
      throw new Error("Connection error. Check your network.");
    if (error.response?.status === 401)
      throw new Error(serverMessage || "Invalid credentials.");
    if (error.response?.status === 403)
      throw new Error("Access denied. You don't have permission.");
    if (error.response?.status === 404)
      throw new Error("Resource not found.");
    if (error.response?.status === 409)
      throw new Error(serverMessage || "Resource already exists.");
    if (error.response?.status === 500)
      throw new Error("Internal server error.");
    throw new Error(serverMessage || "Unknown API error.");
  }
  throw error;
}

// ─── Auth Service ────────────────────────────────────────

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const { data } = await api.post<AuthResponse>(
        "/api/auth/login",
        credentials
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const { data } = await api.post<AuthResponse>(
        "/api/auth/register",
        userData
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  refresh: async (): Promise<AuthResponse> => {
    try {
      const { data } = await api.post<AuthResponse>("/api/auth/refresh");
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Silently fail - limpar estado local de qualquer forma
    }
  },

  getMe: async (signal?: AbortSignal): Promise<AuthResponse["user"]> => {
    try {
      const { data } = await api.get("/api/auth/me", { signal });
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },
};

// ─── Manga Service ───────────────────────────────────────

export const mangaService = {
  getMangas: async (
    limit = 20,
    offset = 0,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Manga>> => {
    try {
      const { data } = await api.get(
        `/api/manga?limit=${limit}&offset=${offset}`,
        { signal }
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  getMangaById: async (id: string, signal?: AbortSignal): Promise<Manga> => {
    try {
      const { data } = await api.get(`/api/manga/local/${id}`, { signal });
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  getMangaWithAuthor: async (
    id: string,
    signal?: AbortSignal
  ): Promise<Manga> => {
    try {
      const { data } = await api.get(`/api/manga/local/with-author/${id}`, {
        signal,
      });
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  getMangasByStatus: async (
    status: string,
    limit = 20,
    offset = 0,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Manga>> => {
    try {
      const { data } = await api.get(
        `/api/manga/by-status/${status}?limit=${limit}&offset=${offset}`,
        { signal }
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  /**
   * Busca mangás por título no banco local (server-side search).
   * Suporta filtro opcional por status.
   */
  searchMangas: async (
    q: string,
    limit = 20,
    offset = 0,
    status?: string,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Manga>> => {
    try {
      const params = new URLSearchParams({
        q,
        limit: String(limit),
        offset: String(offset),
      });
      if (status && status !== "all") params.set("status", status);
      const { data } = await api.get(`/api/manga/search?${params}`, {
        signal,
      });
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  getMangasByYear: async (
    year: string,
    limit = 20,
    offset = 0,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Manga>> => {
    try {
      const { data } = await api.get(
        `/api/manga/by-year/${year}?limit=${limit}&offset=${offset}`,
        { signal }
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  getFeaturedMangas: async (
    limit = 4,
    signal?: AbortSignal
  ): Promise<Manga[]> => {
    try {
      const { data } = await api.get(
        `/api/manga?limit=${limit}&sort=rating,desc`,
        { signal }
      );
      return data.content || [];
    } catch (e) {
      return handleApiError(e);
    }
  },

  getPopularMangas: async (
    limit = 8,
    signal?: AbortSignal
  ): Promise<Manga[]> => {
    try {
      const { data } = await api.get(
        `/api/manga?limit=${limit}&sort=views,desc`,
        { signal }
      );
      return data.content || [];
    } catch (e) {
      return handleApiError(e);
    }
  },
};

// ─── Chapter Service ─────────────────────────────────────

function mapChapter(dto: BackendChapterResponseDto): Chapter {
  const num = dto.chapter
    ? typeof dto.chapter === "number"
      ? dto.chapter
      : parseFloat(String(dto.chapter).replace(",", "."))
    : 0;

  return {
    id: dto.id,
    number: Number.isFinite(num) ? num : 0,
    title: dto.title ?? undefined,
    volume: dto.volume ?? undefined,
    pages: dto.pages ?? undefined,
    language: dto.language ?? undefined,
    releaseDate:
      dto.publishedAt ?? dto.readableAt ?? dto.createdAt ?? undefined,
    mangaId: dto.mangaId ?? dto.manga?.id ?? "",
    imageUrls: dto.imageUrls ?? undefined,
    views: dto.views ?? undefined,
    comments: dto.comments ?? undefined,
  };
}

export const chapterService = {
  getChaptersByMangaId: async (
    mangaId: string,
    signal?: AbortSignal
  ): Promise<Chapter[]> => {
    try {
      const { data } = await api.get(
        `/api/chapter/local/manga/${mangaId}`,
        { signal }
      );
      return (data as BackendChapterResponseDto[]).map(mapChapter);
    } catch (e) {
      return handleApiError(e);
    }
  },

  getChapterWithImages: async (
    chapterId: string,
    signal?: AbortSignal
  ): Promise<Chapter | null> => {
    try {
      const { data } = await api.get(
        `/api/chapter/local/${chapterId}/with-pages`,
        { signal }
      );
      return data ? mapChapter(data as BackendChapterResponseDto) : null;
    } catch (e) {
      return handleApiError(e);
    }
  },

  trackView: async (chapterId: string): Promise<void> => {
    try {
      await api.post(`/api/chapter/local/${chapterId}/view`);
    } catch {
      // silently fail
    }
  },

  getLatestChapters: async (
    limit = 10,
    offset = 0,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Chapter>> => {
    try {
      const { data } = await api.get(
        `/api/chapter/latest?limit=${limit}&offset=${offset}`,
        { signal }
      );
      return {
        ...data,
        content: (data.content as BackendChapterResponseDto[]).map(mapChapter),
      };
    } catch (e) {
      return handleApiError(e);
    }
  },
};

// ─── Admin / Population Service ──────────────────────────

export const adminService = {
  getStats: async (signal?: AbortSignal): Promise<PopulationStats> => {
    try {
      const { data } = await api.get("/api/populate/stats", { signal });
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  populatePopularMangas: async (
    limit = 20,
    offset = 0
  ): Promise<PopulationResult> => {
    try {
      const { data } = await api.post(
        `/api/populate/popular-mangas?limit=${limit}&offset=${offset}`
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  populateRecentMangas: async (
    limit = 20,
    offset = 0
  ): Promise<PopulationResult> => {
    try {
      const { data } = await api.post(
        `/api/populate/recent-mangas?limit=${limit}&offset=${offset}`
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  searchAndSave: async (
    title: string,
    limit = 20,
    offset = 0
  ): Promise<PopulationResult> => {
    try {
      const { data } = await api.post(
        `/api/populate/search-and-save?title=${encodeURIComponent(title)}&limit=${limit}&offset=${offset}`
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  populateChapters: async (mangaId: string): Promise<PopulationResult> => {
    try {
      const { data } = await api.post(
        `/api/populate/chapters/${mangaId}`
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  populateCompletePopular: async (
    mangaLimit = 10,
    offset = 0,
    includeChapters = true
  ): Promise<PopulationResult> => {
    try {
      const { data } = await api.post(
        `/api/populate/complete-popular?mangaLimit=${mangaLimit}&offset=${offset}&includeChapters=${includeChapters}`
      );
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  updateCoverImages: async (): Promise<string> => {
    try {
      const { data } = await api.post("/api/populate/update-cover-images");
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  checkHealth: async (signal?: AbortSignal): Promise<Record<string, string>> => {
    try {
      const { data } = await api.get("/api/health", { signal });
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  /**
   * Deleta um mangá e todos os capítulos associados via DELETE /api/manga/:id
   */
  deleteManga: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/manga/${id}`);
    } catch (e) {
      return handleApiError(e);
    }
  },

  /**
   * Deleta múltiplos mangás em lote via DELETE /api/manga/batch
   * Retorna { deleted: number, requested: number }
   */
  deleteMangasBatch: async (
    ids: string[]
  ): Promise<{ deleted: number; requested: number }> => {
    try {
      const { data } = await api.delete("/api/manga/batch", { data: ids });
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  /**
   * Importa um mangá específico via POST /api/manga/from-api
   * enviando o ExternalMangaDto (formato MangaDex) para o backend salvar.
   */
  saveMangaFromExternal: async (
    externalManga: MangaDexManga
  ): Promise<Manga> => {
    try {
      const { data } = await api.post("/api/manga/from-api", externalManga);
      return data;
    } catch (e) {
      return handleApiError(e);
    }
  },
};

// ─── MangaDex Direct Search ──────────────────────────────
//
// Busca diretamente na API pública do MangaDex para exibir
// preview dos resultados antes de importar.

const MANGADEX_API = "https://api.mangadex.org";

export interface MangaDexManga {
  id: string;
  type: string;
  attributes: {
    title: Record<string, string>;
    altTitles?: Record<string, string>[];
    description?: Record<string, string>;
    status?: string;
    year?: number;
    lastChapter?: string;
    originalLanguage?: string;
    availableTranslatedLanguages?: string[];
  };
  relationships?: {
    id: string;
    type: string;
    attributes?: Record<string, unknown>;
  }[];
}

export interface MangaDexSearchResult {
  id: string;
  title: string;
  titleOriginal?: string;
  description?: string;
  status?: string;
  year?: number;
  lastChapter?: string;
  coverUrl?: string;
  originalLanguage?: string;
  availableLanguages?: string[];
  raw: MangaDexManga; // dados originais para enviar ao backend
}

function extractCoverUrl(manga: MangaDexManga): string | undefined {
  const coverRel = manga.relationships?.find((r) => r.type === "cover_art");
  if (!coverRel?.attributes?.fileName) return undefined;
  return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`;
}

function extractTitle(
  attrs: MangaDexManga["attributes"],
  preferLang: "pt-br" | "en" = "en"
): { title: string; titleOriginal?: string } {
  const titles = attrs.title || {};
  const primary =
    titles[preferLang] ||
    titles["pt-br"] ||
    titles["en"] ||
    Object.values(titles)[0] ||
    "";

  // Se o título principal não é no idioma original, mostrar original
  const origLang = attrs.originalLanguage || "ja";
  const origTitle = titles[origLang];
  const titleOriginal =
    origTitle && origTitle !== primary ? origTitle : undefined;

  return { title: primary, titleOriginal };
}

export const mangadexService = {
  /**
   * Busca mangás no MangaDex com preview completo (capa, autor, etc.)
   */
  search: async (
    query: string,
    limit = 10,
    signal?: AbortSignal
  ): Promise<MangaDexSearchResult[]> => {
    const params = new URLSearchParams({
      title: query,
      limit: String(limit),
      offset: "0",
      "includes[]": "cover_art",
      "order[relevance]": "desc",
      "contentRating[]": "safe",
    });
    // MangaDex needs array params sent individually
    const url = `${MANGADEX_API}/manga?${params.toString()}&includes[]=author`;

    const { data } = await axios.get(url, { signal, timeout: 10000 });
    const results: MangaDexManga[] = data?.data ?? [];

    return results.map((m) => {
      const { title, titleOriginal } = extractTitle(m.attributes);
      const desc =
        m.attributes.description?.["pt-br"] ||
        m.attributes.description?.["en"] ||
        "";

      return {
        id: m.id,
        title,
        titleOriginal,
        description: desc.length > 200 ? desc.slice(0, 200) + "…" : desc,
        status: m.attributes.status,
        year: m.attributes.year ?? undefined,
        lastChapter: m.attributes.lastChapter ?? undefined,
        coverUrl: extractCoverUrl(m),
        originalLanguage: m.attributes.originalLanguage,
        availableLanguages: m.attributes.availableTranslatedLanguages,
        raw: m,
      };
    });
  },
};
