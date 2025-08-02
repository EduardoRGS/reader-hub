'use client';

import { useState } from 'react';
import { Header, Footer } from '@/components';
import {
  ChapterNavigation,
  NavigationTips,
  ChapterContent,
  ScrollToTopButton,
  BottomNavigation,
} from '@/components/reader';
import { ReaderSettings } from '@/components/ReaderSettings';
import { useReaderStoreHydrated } from '@/hooks/useHydration';
import { useChapterReader } from '@/hooks/useChapterReader';

export default function ChapterPage() {
  const [showSettings, setShowSettings] = useState(false);
  const { showPageNumber } = useReaderStoreHydrated();
  
  const {
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
  } = useChapterReader();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando capítulo...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !manga || !chapter) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Capítulo não encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || 'O capítulo que você está procurando não existe.'}
            </p>
            <button
              onClick={goToMangaPage}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Voltar ao mangá
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const title = manga.title?.['pt-br'] || manga.title?.['en'] || 'Título não disponível';
  const chapterTitle = chapter.title || `Capítulo ${chapter.number}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Barra de navegação do capítulo */}
      <ChapterNavigation
        manga={manga}
        chapter={chapter}
        chapters={chapters}
        currentPage={currentPage}
        totalPages={totalPages}
        readingMode={readingMode}
        showChapterSelector={showChapterSelector}
        onGoToMangaPage={goToMangaPage}
        onGoToPreviousChapter={goToPreviousChapter}
        onGoToNextChapter={goToNextChapter}
        onGoToChapter={goToChapter}
        onSetReadingMode={setReadingMode}
        onSetShowChapterSelector={setShowChapterSelector}
      />

      {/* Dicas de navegação */}
      <NavigationTips />

      {/* Área de leitura */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {chapterTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {title} - Capítulo {chapter.number}
          </p>
        </div>

        {/* Conteúdo do capítulo */}
        <ChapterContent
          chapter={chapter}
          readingMode={readingMode}
          currentPage={currentPage}
          totalPages={totalPages}
          imageLoading={imageLoading}
          showPageNumber={showPageNumber}
          onGoToPreviousPage={goToPreviousPage}
          onGoToNextPage={goToNextPage}
          onImageLoad={handleImageLoad}
          onImageError={handleImageError}
        />

        {/* Navegação inferior */}
        <BottomNavigation
          chapter={chapter}
          chapters={chapters}
          onGoToPreviousChapter={goToPreviousChapter}
          onGoToNextChapter={goToNextChapter}
          onGoToMangaPage={goToMangaPage}
        />
      </div>

      {/* Botão Flutuante "Voltar ao Topo" */}
      <ScrollToTopButton
        show={showScrollToTop}
        onClick={scrollToTop}
      />
      
      {/* Botão de Configurações */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg z-40"
        aria-label="Configurações"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      {/* Modal de Configurações */}
      <ReaderSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      <Footer />
    </div>
  );
}