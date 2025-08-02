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
    // Prefetch dos dados do mangá
    await queryClient.prefetchQuery({
      queryKey: queryKeys.manga(mangaId),
      queryFn: () => getMangaById(mangaId),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });

    // Prefetch dos capítulos do mangá
    await queryClient.prefetchQuery({
      queryKey: queryKeys.chapters(mangaId),
      queryFn: () => getChaptersByMangaId(mangaId),
      staleTime: 2 * 60 * 1000, // 2 minutos
    });

    // Prefetch da capa do mangá
    await queryClient.prefetchQuery({
      queryKey: queryKeys.mangaCover(mangaId),
      queryFn: () => mangaService.getMangaCover(mangaId),
      staleTime: 30 * 60 * 1000, // 30 minutos
    });
  };

  /**
   * Prefetch de dados de um capítulo específico
   * Útil quando o usuário está prestes a navegar para a página de leitura
   */
  const prefetchChapter = async (chapterId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.chapter(chapterId),
      queryFn: () => getChapterWithImages(chapterId),
      staleTime: 10 * 60 * 1000, // 10 minutos
    });
  };

  /**
   * Prefetch de dados da página inicial
   * Útil para carregar dados comuns antecipadamente
   */
  const prefetchHomePage = async () => {
    // Prefetch de mangás em destaque
    await queryClient.prefetchQuery({
      queryKey: [...queryKeys.featuredMangas, 4],
      queryFn: () => mangaService.getFeaturedMangas(4),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });

    // Prefetch de mangás populares
    await queryClient.prefetchQuery({
      queryKey: [...queryKeys.popularMangas, 6],
      queryFn: () => mangaService.getPopularMangas(6),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });

    // Prefetch de categorias
    await queryClient.prefetchQuery({
      queryKey: queryKeys.categories,
      queryFn: () => mangaService.getCategories(),
      staleTime: 10 * 60 * 1000, // 10 minutos
    });
  };

  return {
    prefetchManga,
    prefetchChapter,
    prefetchHomePage,
  };
}