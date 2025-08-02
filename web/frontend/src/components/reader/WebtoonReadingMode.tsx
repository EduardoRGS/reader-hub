'use client';

import { Chapter } from '@/types/manga';

interface WebtoonReadingModeProps {
  chapter: Chapter;
  imageLoading: { [key: number]: boolean };
  showPageNumber?: boolean;
  onImageLoad: (index: number) => void;
  onImageError: (index: number) => void;
}

export default function WebtoonReadingMode({
  chapter,
  imageLoading,
  showPageNumber = true,
  onImageLoad,
  onImageError,
}: WebtoonReadingModeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Modo Webtoon
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Otimizado para leitura contínua de manhwas e webtoons
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          💡 Dica: Use a tecla T ou o botão flutuante para voltar ao topo rapidamente
        </p>
      </div>

      {/* Todas as imagens do capítulo em formato webtoon */}
      <div className="w-full max-w-3xl mx-auto space-y-1">
        {chapter.imageUrls!.map((imageUrl, index) => (
          <div key={index} className="w-full">
            {showPageNumber && (
              <div className="text-xs text-right text-gray-500 dark:text-gray-400 mb-1">
                Página {index + 1}
              </div>
            )}
            
            {imageLoading[index + 1] !== false && (
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '200px' }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {showPageNumber ? `Carregando página ${index + 1}...` : 'Carregando...'}
                  </p>
                </div>
              </div>
            )}
            
            <img
              src={imageUrl}
              alt={`Página ${index + 1} do capítulo`}
              className={`w-full rounded-lg shadow-md ${imageLoading[index + 1] !== false ? 'hidden' : ''}`}
              onLoad={() => onImageLoad(index + 1)}
              onError={() => onImageError(index + 1)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}