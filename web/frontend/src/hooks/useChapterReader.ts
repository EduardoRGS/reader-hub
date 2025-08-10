'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMangaById, useChaptersByMangaId, useChapterWithImages } from './queries';
import { useReaderStoreHydrated } from './useHydration';
import { usePrefetch } from './usePrefetch';

export function useChapterReader(mangaId?: string, chapterId?: string) {
  const params = useParams();
  const router = useRouter();
  
  // Usar os parâmetros passados ou os do hook
  const mangaIdValue = mangaId || (params.id as string);
  const chapterIdValue = chapterId || (params.chapterId as string);
  
  // Usar a store para preferências e progresso de leitura
  const { 
    readingMode: storedReadingMode, 
    setReadingMode: setStoredReadingMode,
    updateReadingProgress,
    getLastReadChapter,
    autoNextChapter
  } = useReaderStoreHydrated();
  
  // Estado local
  const [currentPage, setCurrentPage] = useState(1);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const [readingMode, setReadingMode] = useState<'default' | 'webtoon'>(storedReadingMode as 'default' | 'webtoon');
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Prefetching
  const { prefetchChapter } = usePrefetch();


  const mangaQuery = useMangaById(mangaIdValue);
  const chaptersQuery = useChaptersByMangaId(mangaIdValue);
  const chapterQuery = useChapterWithImages(chapterIdValue);

  const manga = mangaQuery.data || null;
  const chapters = useMemo(() => chaptersQuery.data || [], [chaptersQuery.data]);
  const chapter = chapterQuery.data || null;

  const loading = mangaQuery.isLoading || chaptersQuery.isLoading || chapterQuery.isLoading;
  const error = mangaQuery.error || chaptersQuery.error || chapterQuery.error;
  const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

  const totalPages = chapter?.imageUrls?.length || chapter?.pages || 1;

  // Inicializar estado de carregamento de imagens
  useEffect(() => {
    if (chapter?.imageUrls && chapter.imageUrls.length > 0) {
      const initialLoadingState: { [key: number]: boolean } = {};
      chapter.imageUrls.forEach((_, index) => {
        initialLoadingState[index + 1] = true;
      });
      setImageLoading(initialLoadingState);
    } else {
      setImageLoading({});
    }
  }, [chapter?.id, chapter?.imageUrls]);
  
  // Sincronizar modo de leitura com o estado global
  useEffect(() => {
    setReadingMode(storedReadingMode as 'default' | 'webtoon');
  }, [storedReadingMode]);

  // Carregar último progresso de leitura
  useEffect(() => {
    if (mangaIdValue && chapterIdValue && chapter) {
      const lastProgress = getLastReadChapter(mangaIdValue);
      if (lastProgress && lastProgress.chapterId === chapterIdValue) {
        setCurrentPage(lastProgress.page);
      } else {
        setCurrentPage(1);
      }
    }
  }, [mangaIdValue, chapterIdValue, chapter, getLastReadChapter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showChapterSelector && !target.closest('.chapter-selector')) {
        setShowChapterSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChapterSelector]);


  useEffect(() => {
    const handleScroll = () => {
      if (readingMode === 'webtoon') {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setShowScrollToTop(scrollTop > 300);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [readingMode]);

  // Salvar progresso de leitura
  useEffect(() => {
    if (mangaIdValue && chapterIdValue && currentPage > 0) {
      updateReadingProgress({
        mangaId: mangaIdValue,
        chapterId: chapterIdValue,
        page: currentPage
      });
    }
  }, [mangaIdValue, chapterIdValue, currentPage, updateReadingProgress]);
  
  // Prefetch próximo capítulo
  useEffect(() => {
    if (chapter && chapters.length) {
      const currentIndex = chapters.findIndex((ch) => ch.id === chapter.id);
      if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
        const nextChapter = chapters[currentIndex + 1];
        prefetchChapter(nextChapter.id);
      }
    }
  }, [chapter, chapters, prefetchChapter]);

  // Controles de teclado
  const goToPreviousChapter = useCallback(() => {
    if (!chapter || !chapters.length) return;
    const currentIndex = chapters.findIndex((ch) => ch.id === chapter.id);
    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1];
      router.push(`/manga/${mangaIdValue}/chapter/${prevChapter.id}`);
    }
  }, [chapter, chapters, mangaIdValue, router]);

  const goToNextChapter = useCallback(() => {
    if (!chapter || !chapters.length) return;
    const currentIndex = chapters.findIndex((ch) => ch.id === chapter.id);
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      router.push(`/manga/${mangaIdValue}/chapter/${nextChapter.id}`);
    }
  }, [chapter, chapters, mangaIdValue, router]);

  const goToMangaPage = useCallback(() => {
    router.push(`/manga/${mangaIdValue}`);
  }, [mangaIdValue, router]);

  const goToChapter = useCallback((chapterId: string) => {
    setShowChapterSelector(false);
    setCurrentPage(1);
    router.push(`/manga/${mangaIdValue}/chapter/${chapterId}`);
  }, [mangaIdValue, router]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    } else if (autoNextChapter) {
      goToNextChapter();
    }
  }, [currentPage, totalPages, autoNextChapter, goToNextChapter]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    } else {
      goToPreviousChapter();
    }
  }, [currentPage, goToPreviousChapter]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (event.ctrlKey || event.metaKey) {
            goToPreviousChapter();
          } else if (readingMode === 'default') {
            goToPreviousPage();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (event.ctrlKey || event.metaKey) {
            goToNextChapter();
          } else if (readingMode === 'default') {
            goToNextPage();
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (showChapterSelector) {
            setShowChapterSelector(false);
          } else {
            goToMangaPage();
          }
          break;
        case 'Home':
          event.preventDefault();
          if (readingMode === 'default') {
            setCurrentPage(1);
          }
          break;
        case 'End':
          event.preventDefault();
          if (readingMode === 'default') {
            setCurrentPage(totalPages);
          }
          break;
        case 'c':
        case 'C':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setShowChapterSelector(!showChapterSelector);
          }
          break;
        case 't':
        case 'T':
          if (readingMode === 'webtoon' && showScrollToTop) {
            event.preventDefault();
            scrollToTop();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPreviousChapter, goToNextChapter, goToPreviousPage, goToNextPage, goToMangaPage, scrollToTop, readingMode, showChapterSelector, showScrollToTop, totalPages]);

  // Funções de navegação
  // goToNextChapter já está declarado acima

  // goToNextChapter já é useCallback acima

  const handleImageLoad = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleReadingModeChange = (mode: 'default' | 'webtoon') => {
    setReadingMode(mode);
    setStoredReadingMode(mode);
  };

  return {
    // Estados
    manga,
    chapter,
    chapters,
    currentPage,
    totalPages,
    loading,
    error: error ? errorMessage : null,
    imageLoading,
    readingMode,
    showChapterSelector,
    showScrollToTop,
    
    // Funções
    goToNextChapter,
    goToPreviousChapter,
    goToMangaPage,
    goToChapter,
    scrollToTop,
    goToNextPage,
    goToPreviousPage,
    handleImageLoad,
    handleImageError,
    setReadingMode: handleReadingModeChange,
    setShowChapterSelector,
    setCurrentPage,
  };
}