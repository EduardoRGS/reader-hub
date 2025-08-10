import { useQuery, useQueryClient, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { mangaService, getMangaById, getChaptersByMangaId, getChapterWithImages } from '@/services/api';
export const queryKeys = {
  mangas: ['mangas'] as const,
  manga: (id: string) => ['manga', id] as const,
  featuredMangas: ['mangas', 'featured'] as const,
  popularMangas: ['mangas', 'popular'] as const,
  categories: ['categories'] as const,
  chapters: (mangaId: string) => ['chapters', mangaId] as const,
  chapter: (chapterId: string) => ['chapter', chapterId] as const,
  mangaCover: (mangaId: string) => ['manga-cover', mangaId] as const,
  searchMangas: (query: string) => ['search-mangas', query] as const,
  mangasPaginated: (limit: number, offset: number) => ['mangas', 'paginated', limit, offset] as const,
  mangasByStatus: (status: string, limit: number, offset: number) => ['mangas', 'status', status, limit, offset] as const,
  featured: () => ['mangas', 'featured'] as const,
  popular: () => ['mangas', 'popular'] as const,
  infiniteMangas: (status: string, limit: number) => ['mangas', 'infinite', status, limit] as const,
  searchExternal: (query: string, limit: number, offset: number) => ['search', 'external', query, limit, offset] as const,
} as const;

export function useMangas(limit: number = 20, offset: number = 0) {
  return useQuery({
    queryKey: queryKeys.mangasPaginated(limit, offset),
    queryFn: ({ signal }) => mangaService.getMangas(limit, offset, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMangasByStatus(status: string, limit: number = 20, offset: number = 0) {
  return useQuery({
    queryKey: queryKeys.mangasByStatus(status, limit, offset),
    queryFn: ({ signal }) => mangaService.getMangasByStatus(status, limit, offset, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedMangas() {
  return useQuery({
    queryKey: queryKeys.featured(),
    queryFn: ({ signal }) => mangaService.getFeaturedMangas(undefined, signal),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePopularMangas() {
  return useQuery({
    queryKey: queryKeys.popular(),
    queryFn: ({ signal }) => mangaService.getPopularMangas(undefined, signal),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: ({ signal }) => mangaService.getCategories(signal),
    staleTime: 30 * 60 * 1000,
  });
}

export function useMangaById(id: string) {
  return useQuery({
    queryKey: queryKeys.manga(id),
    queryFn: ({ signal }) => getMangaById(id, signal),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMangaCover(id: string) {
  return useQuery({
    queryKey: queryKeys.mangaCover(id),
    queryFn: ({ signal }) => mangaService.getMangaCover(id, signal),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}

export function useChaptersByMangaId(mangaId: string) {
  return useQuery({
    queryKey: queryKeys.chapters(mangaId),
    queryFn: ({ signal }) => getChaptersByMangaId(mangaId, signal),
    enabled: !!mangaId,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    gcTime: 30 * 60 * 1000,
  });
}

export function useChapterWithImages(chapterId: string) {
  return useQuery({
    queryKey: queryKeys.chapter(chapterId),
    queryFn: ({ signal }) => getChapterWithImages(chapterId, signal),
    enabled: !!chapterId,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
    gcTime: 30 * 60 * 1000,
  });
}

export function useInfiniteMangas(status: string = 'all', limit: number = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.infiniteMangas(status, limit),
    queryFn: ({ pageParam = 0, signal }) => {
      if (status === 'all') {
        return mangaService.getMangas(limit, pageParam, signal);
      }
      return mangaService.getMangasByStatus(status, limit, pageParam, signal);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.number >= lastPage.totalPages - 1) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
    maxPages: 5,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchExternalMangas(query: string, limit: number = 20, offset: number = 0) {
  return useQuery({
    queryKey: queryKeys.searchExternal(query, limit, offset),
    queryFn: ({ signal }) => mangaService.searchExternalMangas(query, limit, offset, signal),
    enabled: !!query && query.length > 2,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}
export const useInvalidateMangas = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAllMangas: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mangas });
    },
    invalidateManga: (id: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.manga(id) });
    },
    invalidateChapters: (mangaId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters(mangaId) });
    },
    invalidateChapter: (chapterId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chapter(chapterId) });
    },
  };
};