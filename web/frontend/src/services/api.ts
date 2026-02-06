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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Retry interceptor para erros de rede
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const req = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (
      (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") &&
      req &&
      !req._retry
    ) {
      req._retry = true;
      await new Promise((r) => setTimeout(r, 1000));
      return api.request(req);
    }
    return Promise.reject(error);
  }
);

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED")
      throw new Error("Tempo limite excedido. Tente novamente.");
    if (error.code === "ERR_NETWORK")
      throw new Error("Erro de conexão. Verifique sua internet.");
    if (error.response?.status === 404)
      throw new Error("Recurso não encontrado.");
    if (error.response?.status === 500)
      throw new Error("Erro interno do servidor.");
    throw new Error(
      error.response?.data?.message || "Erro desconhecido na API."
    );
  }
  throw error;
}

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
