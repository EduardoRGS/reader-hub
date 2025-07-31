'use client';

import { Chapter, Manga } from '@/types/manga';

interface ChapterNavigationProps {
  manga: Manga;
  chapter: Chapter;
  chapters: Chapter[];
  currentPage: number;
  totalPages: number;
  readingMode: 'default' | 'list';
  showChapterSelector: boolean;
  onGoToMangaPage: () => void;
  onGoToPreviousChapter: () => void;
  onGoToNextChapter: () => void;
  onGoToChapter: (chapterId: string) => void;
  onSetReadingMode: (mode: 'default' | 'list') => void;
  onSetShowChapterSelector: (show: boolean) => void;
}

export default function ChapterNavigation({
  manga,
  chapter,
  chapters,
  currentPage,
  totalPages,
  readingMode,
  showChapterSelector,
  onGoToMangaPage,
  onGoToPreviousChapter,
  onGoToNextChapter,
  onGoToChapter,
  onSetReadingMode,
  onSetShowChapterSelector,
}: ChapterNavigationProps) {
  const title = manga.title?.['pt-br'] || manga.title?.['en'] || 'Título não disponível';
  const chapterTitle = chapter.title || `Capítulo ${chapter.number}`;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onGoToMangaPage}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← Voltar ao mangá
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {title} - {chapterTitle}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Seletor de Capítulos */}
            <div className="relative chapter-selector">
              <button
                onClick={() => onSetShowChapterSelector(!showChapterSelector)}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                📚 Capítulos
              </button>
              
              {showChapterSelector && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                      Capítulos disponíveis ({chapters.length})
                    </div>
                    {chapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => onGoToChapter(ch.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          ch.id === chapter.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="font-medium">
                          Capítulo {ch.number}
                        </div>
                        {ch.title && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {ch.title}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modo de Leitura */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => onSetReadingMode('default')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  readingMode === 'default'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                📄 Página
              </button>
              <button
                onClick={() => onSetReadingMode('list')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  readingMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                📋 Lista
              </button>
            </div>

            <button
              onClick={onGoToPreviousChapter}
              disabled={chapters.findIndex(ch => ch.id === chapter.id) === 0}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Página {currentPage} de {totalPages}
              {readingMode === 'list' && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">📋 Lista</span>
              )}
            </span>
            <button
              onClick={onGoToNextChapter}
              disabled={chapters.findIndex(ch => ch.id === chapter.id) === chapters.length - 1}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próximo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 