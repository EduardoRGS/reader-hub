import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Manga, Chapter, PaginatedResponse, BackendChapterResponseDto } from '@/types/manga';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Configuração do axios com timeouts e retry logic
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Se for um erro de rede ou timeout, tentar novamente até 3 vezes
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Aguardar 1 segundo antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return api.request(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

// Função para tratar erros de forma consistente
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Tempo limite da requisição excedido. Tente novamente.');
    }
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    if (error.response?.status === 500) {
      throw new Error('Erro interno do servidor. Tente novamente em alguns instantes.');
    }
    throw new Error(error.response?.data?.message || 'Erro desconhecido');
  }
  throw error;
};

// Interface para categorias
export interface Category {
  name: string;
  count: number;
  color: string;
}

export const mangaService = {
  // Buscar mangás do banco local
  getMangas: async (
    limit: number = 20,
    offset: number = 0,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Manga>> => {
    try {
      const response = await api.get(`/api/manga?limit=${limit}&offset=${offset}`, { signal });
      return response.data;
    } catch (error) {
        return handleApiError(error);
    }
  },

  // Buscar manga por ID
  getMangaById: async (id: string, signal?: AbortSignal): Promise<Manga> => {
    try {
      const response = await api.get(`/api/manga/local/${id}`, { signal });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Buscar mangás por status
  getMangasByStatus: async (
    status: string,
    limit: number = 20,
    offset: number = 0,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Manga>> => {
    try {
      const response = await api.get(`/api/manga?status=${status}&limit=${limit}&offset=${offset}`, { signal });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Buscar mangás em destaque (com maior rating)
  getFeaturedMangas: async (limit: number = 4, signal?: AbortSignal): Promise<Manga[]> => {
    try {
      const response = await api.get(`/api/manga?limit=${limit}&sort=rating,desc`, { signal });
      return response.data.content || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Buscar mangás populares (com mais views)
  getPopularMangas: async (limit: number = 6, signal?: AbortSignal): Promise<Manga[]> => {
    try {
      const response = await api.get(`/api/manga?limit=${limit}&sort=views,desc`, { signal });
      return response.data.content || [];
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Buscar categorias
  getCategories: async (signal?: AbortSignal): Promise<Category[]> => {
    try {
      const response = await api.get('/api/manga/categories', { signal });
      return response.data || [];
    } catch {
      // Se não houver endpoint de categorias, retornar categorias padrão
      return [
        { name: "Ação", count: 0, color: "from-red-500 to-orange-500" },
        { name: "Romance", count: 0, color: "from-pink-500 to-rose-500" },
        { name: "Comédia", count: 0, color: "from-yellow-500 to-amber-500" },
        { name: "Drama", count: 0, color: "from-blue-500 to-indigo-500" },
        { name: "Fantasia", count: 0, color: "from-purple-500 to-violet-500" },
        { name: "Slice of Life", count: 0, color: "from-green-500 to-emerald-500" },
        { name: "Sobrenatural", count: 0, color: "from-teal-500 to-cyan-500" },
        { name: "Esportes", count: 0, color: "from-orange-500 to-red-500" }
      ];
    }
  },

  // Buscar capa do manga
  getMangaCover: async (mangaId: string, signal?: AbortSignal): Promise<string> => {
    try {
      const response = await api.get(`/api/manga/external/${mangaId}/cover`, { signal });
      return response.data.coverUrl;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Buscar mangás da API externa
  searchExternalMangas: async (
    query: string,
    limit: number = 20,
    offset: number = 0,
    signal?: AbortSignal
  ): Promise<PaginatedResponse<Manga>> => {
    try {
      const response = await api.get(`/api/manga/external?title=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
        { signal }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Funções para a página do mangá
export const getMangaById = async (id: string, signal?: AbortSignal): Promise<Manga> => {
  return mangaService.getMangaById(id, signal);
};

export const getChaptersByMangaId = async (mangaId: string, signal?: AbortSignal): Promise<Chapter[]> => {
  try {
    const response = await api.get(`/api/chapter/local/manga/${mangaId}`, { signal });
    const data = (response.data as BackendChapterResponseDto[]) || [];
    return data.map(mapChapterResponseToChapter);
  } catch (error) {
    return handleApiError(error);
  }
};

// Buscar capítulo específico com imagens
export const getChapterWithImages = async (chapterId: string, signal?: AbortSignal): Promise<Chapter | null> => {
  try {
    const response = await api.get(`/api/chapter/local/${chapterId}/with-pages`, { signal });
    const dto = response.data as BackendChapterResponseDto;
    return dto ? mapChapterResponseToChapter(dto) : null;
  } catch (error) {
    return handleApiError(error);
  }
};

// Mapeia ChapterResponseDto (backend) -> Chapter (frontend)
function mapChapterResponseToChapter(dto: BackendChapterResponseDto): Chapter {
  const numberValue: number = dto.chapter
    ? typeof dto.chapter === 'number'
      ? dto.chapter
      : parseFloat(String(dto.chapter).replace(',', '.'))
    : 0;
  return {
    id: dto.id,
    number: Number.isFinite(numberValue) ? numberValue : 0,
    title: dto.title ?? undefined,
    pages: dto.pages ?? undefined,
    releaseDate: dto.publishedAt ?? dto.readableAt ?? dto.createdAt ?? undefined,
    isRead: undefined,
    mangaId: dto.mangaId ?? dto.manga?.id,
    imageUrls: dto.imageUrls ?? undefined,
  } as Chapter;
}