import { useEffect } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { mangaService, chapterService, adminService } from "@/services/api";

// ─── Query Keys ──────────────────────────────────────────

export const queryKeys = {
  mangas: ["mangas"] as const,
  manga: (id: string) => ["manga", id] as const,
  mangaWithAuthor: (id: string) => ["manga", id, "with-author"] as const,
  featured: () => ["mangas", "featured"] as const,
  popular: () => ["mangas", "popular"] as const,
  chapters: (mangaId: string) => ["chapters", mangaId] as const,
  chapter: (chapterId: string) => ["chapter", chapterId] as const,
  latestChapters: () => ["chapters", "latest"] as const,
  infiniteMangas: (status: string, limit: number) =>
    ["mangas", "infinite", status, limit] as const,
  stats: () => ["admin", "stats"] as const,
  health: () => ["admin", "health"] as const,
} as const;

// ─── Manga Queries ───────────────────────────────────────

export function useMangas(limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...queryKeys.mangas, limit, offset],
    queryFn: ({ signal }) => mangaService.getMangas(limit, offset, signal),
    placeholderData: keepPreviousData,
  });
}

export function useFeaturedMangas() {
  return useQuery({
    queryKey: queryKeys.featured(),
    queryFn: ({ signal }) => mangaService.getFeaturedMangas(4, signal),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePopularMangas() {
  return useQuery({
    queryKey: queryKeys.popular(),
    queryFn: ({ signal }) => mangaService.getPopularMangas(8, signal),
    staleTime: 10 * 60 * 1000,
  });
}

export function useMangaById(id: string) {
  return useQuery({
    queryKey: queryKeys.manga(id),
    queryFn: ({ signal }) => mangaService.getMangaById(id, signal),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMangaWithAuthor(id: string) {
  return useQuery({
    queryKey: queryKeys.mangaWithAuthor(id),
    queryFn: ({ signal }) => mangaService.getMangaWithAuthor(id, signal),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useInfiniteMangas(status = "all", limit = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.infiniteMangas(status, limit),
    queryFn: ({ pageParam = 0, signal }) => {
      if (status === "all") {
        return mangaService.getMangas(limit, pageParam, signal);
      }
      return mangaService.getMangasByStatus(status, limit, pageParam, signal);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.number >= lastPage.totalPages - 1) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
  });
}

/**
 * Hook para paginação clássica da biblioteca.
 * Busca mangás com suporte a busca por título (server-side) e filtro por status.
 */
export function useLibraryMangas(
  page: number,
  limit: number,
  status: string,
  search: string
) {
  const offset = page * limit;
  const hasSearch = search.trim().length >= 2;

  return useQuery({
    queryKey: ["library", page, limit, status, search],
    queryFn: ({ signal }) => {
      if (hasSearch) {
        return mangaService.searchMangas(
          search.trim(),
          limit,
          offset,
          status !== "all" ? status : undefined,
          signal
        );
      }
      if (status !== "all") {
        return mangaService.getMangasByStatus(status, limit, offset, signal);
      }
      return mangaService.getMangas(limit, offset, signal);
    },
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Chapter Queries ─────────────────────────────────────

export function useChaptersByMangaId(mangaId: string) {
  return useQuery({
    queryKey: queryKeys.chapters(mangaId),
    queryFn: ({ signal }) =>
      chapterService.getChaptersByMangaId(mangaId, signal),
    enabled: !!mangaId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChapterWithImages(chapterId: string) {
  return useQuery({
    queryKey: queryKeys.chapter(chapterId),
    queryFn: ({ signal }) =>
      chapterService.getChapterWithImages(chapterId, signal),
    enabled: !!chapterId,
    staleTime: 30 * 60 * 1000, // imagens não mudam - cache por 30min
    gcTime: 60 * 60 * 1000, // manter 1h no garbage collector
  });
}

export function useLatestChapters(limit = 10) {
  return useQuery({
    queryKey: queryKeys.latestChapters(),
    queryFn: ({ signal }) =>
      chapterService.getLatestChapters(limit, 0, signal),
  });
}

// ─── Admin Queries ───────────────────────────────────────

export function usePopulationStats() {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: ({ signal }) => adminService.getStats(signal),
    staleTime: 30 * 1000,
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: ({ signal }) => adminService.checkHealth(signal),
    staleTime: 10 * 1000,
    retry: false,
  });
}

// ─── Admin Mutations ─────────────────────────────────────

export function usePopulatePopular() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ limit, offset }: { limit?: number; offset?: number }) =>
      adminService.populatePopularMangas(limit, offset),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mangas });
      qc.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

export function usePopulateRecent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ limit, offset }: { limit?: number; offset?: number }) =>
      adminService.populateRecentMangas(limit, offset),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mangas });
      qc.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

export function useSearchAndSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      limit,
      offset,
    }: {
      title: string;
      limit?: number;
      offset?: number;
    }) => adminService.searchAndSave(title, limit, offset),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mangas });
      qc.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

export function usePopulateChapters() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mangaId: string) => adminService.populateChapters(mangaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

export function usePopulateComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      mangaLimit,
      offset,
      includeChapters,
    }: {
      mangaLimit?: number;
      offset?: number;
      includeChapters?: boolean;
    }) =>
      adminService.populateCompletePopular(
        mangaLimit,
        offset,
        includeChapters
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mangas });
      qc.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}

export function useDeleteManga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mangaId: string) => adminService.deleteManga(mangaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mangas });
      qc.invalidateQueries({ queryKey: queryKeys.stats() });
      qc.invalidateQueries({ queryKey: queryKeys.featured() });
      qc.invalidateQueries({ queryKey: queryKeys.popular() });
    },
  });
}

export function useDeleteMangasBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => adminService.deleteMangasBatch(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mangas });
      qc.invalidateQueries({ queryKey: queryKeys.stats() });
      qc.invalidateQueries({ queryKey: queryKeys.featured() });
      qc.invalidateQueries({ queryKey: queryKeys.popular() });
    },
  });
}

export function useUpdateCovers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminService.updateCoverImages(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.mangas });
    },
  });
}

// ─── Prefetch Helpers ────────────────────────────────────

/**
 * Prefetch capítulos de um mangá em paralelo com o fetch principal.
 * Útil na página de detalhes: enquanto carrega o mangá,
 * já começa a buscar a lista de capítulos.
 */
export function usePrefetchChapters(mangaId: string) {
  const qc = useQueryClient();

  // Fix: side effect deve estar dentro de useEffect, não no corpo do hook
  useEffect(() => {
    if (mangaId) {
      qc.prefetchQuery({
        queryKey: queryKeys.chapters(mangaId),
        queryFn: ({ signal }) =>
          chapterService.getChaptersByMangaId(mangaId, signal),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [qc, mangaId]);
}

// ─── Invalidation Helpers ────────────────────────────────

export function useInvalidateMangas() {
  const qc = useQueryClient();
  return {
    invalidateAll: () =>
      qc.invalidateQueries({ queryKey: queryKeys.mangas }),
    invalidateManga: (id: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.manga(id) }),
    invalidateChapters: (mangaId: string) =>
      qc.invalidateQueries({ queryKey: queryKeys.chapters(mangaId) }),
  };
}
