'use client';

import { Chapter } from '@/types/manga';
import DefaultReadingMode from './DefaultReadingMode';
import WebtoonReadingMode from './WebtoonReadingMode';

interface ChapterContentProps {
  chapter: Chapter;
  readingMode: 'default' | 'webtoon';
  currentPage: number;
  totalPages: number;
  imageLoading: { [key: number]: boolean };
  showPageNumber?: boolean;
  onGoToPreviousPage: () => void;
  onGoToNextPage: () => void;
  onImageLoad: (index: number) => void;
  onImageError: (index: number) => void;
}

export default function ChapterContent({
  chapter,
  readingMode,
  currentPage,
  totalPages,
  imageLoading,
  showPageNumber = true,
  onGoToPreviousPage,
  onGoToNextPage,
  onImageLoad,
  onImageError,
}: ChapterContentProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      {chapter.imageUrls && chapter.imageUrls.length > 0 ? (
        readingMode === 'default' ? (
          <DefaultReadingMode
            chapter={chapter}
            currentPage={currentPage}
            totalPages={totalPages}
            imageLoading={imageLoading}
            onGoToPreviousPage={onGoToPreviousPage}
            onGoToNextPage={onGoToNextPage}
            onImageLoad={onImageLoad}
            onImageError={onImageError}
            showPageNumber={showPageNumber}
          />
        ) : (
          <WebtoonReadingMode
            chapter={chapter}
            imageLoading={imageLoading}
            onImageLoad={onImageLoad}
            onImageError={onImageError}
            showPageNumber={showPageNumber}
          />
        )
      ) : chapter.pages && chapter.pages > 0 ? (
        <div className="space-y-4">
          {/* Fallback para capítulos sem imagens mas com contagem de páginas */}
          {Array.from({ length: Math.min(chapter.pages, 5) }, (_, index) => (
            <div
              key={index}
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
              style={{ aspectRatio: '3/4' }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📖</div>
                  <p className="text-sm">Página {index + 1}</p>
                  <p className="text-xs mt-1">Imagens não disponíveis</p>
                </div>
              </div>
            </div>
          ))}
          
          {chapter.pages > 5 && (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                ... e mais {chapter.pages - 5} páginas
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Conteúdo não disponível
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            O conteúdo deste capítulo ainda não foi carregado.
          </p>
        </div>
      )}
    </div>
  );
}