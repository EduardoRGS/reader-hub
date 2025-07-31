'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Manga, Chapter } from '@/types/manga';
import { getMangaById, getChaptersByMangaId, getChapterWithImages } from '@/services/api';

export function useChapterReader() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;
  const chapterId = params.chapterId as string;
  
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const [readingMode, setReadingMode] = useState<'default' | 'list'>('default');
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Calcular total de páginas baseado no capítulo atual
  const totalPages = chapter?.imageUrls?.length || chapter?.pages || 1;

  // Buscar dados do capítulo
  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar dados do mangá
        const mangaData = await getMangaById(mangaId);
        setManga(mangaData);
        
        // Buscar capítulos do mangá
        const chaptersData = await getChaptersByMangaId(mangaId);
        setChapters(chaptersData);
        
        // Buscar capítulo específico com imagens
        const chapterWithImages = await getChapterWithImages(chapterId);
        if (chapterWithImages) {
          setChapter(chapterWithImages);
          // Inicializar estado de carregamento das imagens
          if (chapterWithImages.imageUrls && chapterWithImages.imageUrls.length > 0) {
            const initialLoadingState: { [key: number]: boolean } = {};
            chapterWithImages.imageUrls.forEach((_, index) => {
              initialLoadingState[index + 1] = true;
            });
            setImageLoading(initialLoadingState);
          }
        } else {
          setError('Capítulo não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar dados do capítulo');
        console.error('Erro ao buscar capítulo:', err);
      } finally {
        setLoading(false);
      }
    };

    if (mangaId && chapterId) {
      fetchChapterData();
    }
  }, [mangaId, chapterId]);

  // Fechar seletor de capítulos quando clicar fora
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

  // Detectar scroll para mostrar/esconder botão "Voltar ao Topo"
  useEffect(() => {
    const handleScroll = () => {
      if (readingMode === 'list') {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setShowScrollToTop(scrollTop > 300); // Mostrar após 300px de scroll
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [readingMode]);

  // Controles de teclado
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
          if (readingMode === 'list' && showScrollToTop) {
            event.preventDefault();
            scrollToTop();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [chapter, chapters, currentPage, totalPages, readingMode, showChapterSelector, showScrollToTop]);

  // Funções de navegação
  const goToNextChapter = () => {
    if (!chapter || !chapters.length) return;
    
    const currentIndex = chapters.findIndex(ch => ch.id === chapter.id);
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      router.push(`/manga/${mangaId}/chapter/${nextChapter.id}`);
    }
  };

  const goToPreviousChapter = () => {
    if (!chapter || !chapters.length) return;
    
    const currentIndex = chapters.findIndex(ch => ch.id === chapter.id);
    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1];
      router.push(`/manga/${mangaId}/chapter/${prevChapter.id}`);
    }
  };

  const goToMangaPage = () => {
    router.push(`/manga/${mangaId}`);
  };

  const goToChapter = (chapterId: string) => {
    setShowChapterSelector(false);
    setCurrentPage(1); // Reset para primeira página
    router.push(`/manga/${mangaId}/chapter/${chapterId}`);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleImageLoad = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  return {
    // Estados
    manga,
    chapter,
    chapters,
    currentPage,
    totalPages,
    loading,
    error,
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
    setReadingMode,
    setShowChapterSelector,
    setCurrentPage,
  };
} 