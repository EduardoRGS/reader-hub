'use client';

import { Chapter } from '@/types/manga';
import Image from 'next/image';

interface DefaultReadingModeProps {
  chapter: Chapter;
  currentPage: number;
  totalPages: number;
  imageLoading: { [key: number]: boolean };
  showPageNumber?: boolean;
  onGoToPreviousPage: () => void;
  onGoToNextPage: () => void;
  onImageLoad: (index: number) => void;
  onImageError: (index: number) => void;
}

export default function DefaultReadingMode({
  chapter,
  currentPage,
  totalPages,
  imageLoading,
  showPageNumber = true,
  onGoToPreviousPage,
  onGoToNextPage,
  onImageLoad,
  onImageError,
}: DefaultReadingModeProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onGoToPreviousPage}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Página Anterior
        </button>
        
        <div className="text-center">
          {showPageNumber && (
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Página {currentPage} de {totalPages}
            </span>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Use as setas ← → para navegar entre páginas
          </div>
        </div>
        
        <button
          onClick={onGoToNextPage}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Próxima Página →
        </button>
      </div>

      {/* Imagem atual do capítulo */}
      <div className="w-full flex justify-center">
        {imageLoading[currentPage] !== false && (
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Carregando página {currentPage}...</p>
            </div>
          </div>
        )}

        <div
          className={`relative w-full ${imageLoading[currentPage] !== false ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{ aspectRatio: '3/4' }}
        >
          <Image
            src={chapter.imageUrls![currentPage - 1]}
            alt={`Página ${currentPage} do capítulo`}
            fill
            sizes="100vw"
            className="object-contain rounded-lg shadow-md"
            priority={currentPage === 1}
            onLoad={() => onImageLoad(currentPage)}
            onLoadingComplete={() => onImageLoad(currentPage)}
            onError={() => onImageError(currentPage)}
          />
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentPage / totalPages) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}