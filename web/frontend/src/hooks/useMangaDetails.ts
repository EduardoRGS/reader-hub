'use client';


import { useParams } from 'next/navigation';
import { useMangaById, useChaptersByMangaId } from './queries';

export function useMangaDetails(mangaId?: string) {
  const params = useParams();
  const id = mangaId || params?.id as string;

  const {
    data: manga,
    isLoading: mangaLoading,
    error: mangaError,
    refetch: refetchManga
  } = useMangaById(id);

  const {
    data: chapters,
    isLoading: chaptersLoading,
    error: chaptersError,
    refetch: refetchChapters
  } = useChaptersByMangaId(id);

  const loading = mangaLoading || chaptersLoading;
  const error = mangaError || chaptersError;

  // Função para recarregar todos os dados
  const refetch = async () => {
    await Promise.all([refetchManga(), refetchChapters()]);
  };

  return {
    manga,
    chapters: chapters || [],
    loading,
    error,
    totalChapters: chapters?.length || 0,
    lastChapter: chapters?.[chapters.length - 1],
    firstChapter: chapters?.[0],
    hasChapters: (chapters?.length || 0) > 0,
    refetch,
    refetchManga,
    refetchChapters,
  };
}