'use client';

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queries';
import { mangaService, getMangaById, getChaptersByMangaId, getChapterWithImages } from '@/services/api';

/**
 * Hook para prefetching de dados
 * Permite carregar dados antecipadamente para melhorar a experiência de navegação
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  /**
   * Prefetch de dados de um mangá específico
   * Útil quando o usuário está prestes a navegar para a página de detalhes
   */
  const prefetchManga = async (mangaId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.manga(mangaId),
        queryFn: ({ signal }) => getMangaById(mangaId, signal),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.chapters(mangaId),
        queryFn: ({ signal }) => getChaptersByMangaId(mangaId, signal),
        staleTime: 2 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.mangaCover(mangaId),
        queryFn: ({ signal }) => mangaService.getMangaCover(mangaId, signal),
        staleTime: 30 * 60 * 1000,
      }),
    ]);
  };

  /**
   * Prefetch de dados de um capítulo específico
   * Útil quando o usuário está prestes a navegar para a página de leitura
   */
  const prefetchChapter = async (chapterId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.chapter(chapterId),
      queryFn: ({ signal }) => getChapterWithImages(chapterId, signal),
      staleTime: 2 * 60 * 1000,
    });
  };

  /**
   * Prefetch de dados da página inicial
   * Útil para carregar dados comuns antecipadamente
   */
  const prefetchHomePage = async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.featured(),
        queryFn: ({ signal }) => mangaService.getFeaturedMangas(undefined, signal),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.popular(),
        queryFn: ({ signal }) => mangaService.getPopularMangas(undefined, signal),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.categories,
        queryFn: ({ signal }) => mangaService.getCategories(signal),
        staleTime: 10 * 60 * 1000,
      }),
    ]);
  };

  return {
    prefetchManga,
    prefetchChapter,
    prefetchHomePage,
  };
}