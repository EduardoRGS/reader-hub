'use client';

import { Chapter } from '@/types/manga';

interface BottomNavigationProps {
  chapter: Chapter;
  chapters: Chapter[];
  onGoToPreviousChapter: () => void;
  onGoToNextChapter: () => void;
  onGoToMangaPage: () => void;
}

export default function BottomNavigation({
  chapter,
  chapters,
  onGoToPreviousChapter,
  onGoToNextChapter,
  onGoToMangaPage,
}: BottomNavigationProps) {
  return (
    <div className="flex items-center justify-between mt-8">
      <button
        onClick={onGoToPreviousChapter}
        disabled={chapters.findIndex(ch => ch.id === chapter.id) === 0}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span>←</span>
        <span>Capítulo Anterior</span>
      </button>
      
      <button
        onClick={onGoToMangaPage}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        Lista de Capítulos
      </button>
      
      <button
        onClick={onGoToNextChapter}
        disabled={chapters.findIndex(ch => ch.id === chapter.id) === chapters.length - 1}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span>Próximo Capítulo</span>
        <span>→</span>
      </button>
    </div>
  );
} 