'use client';

import { Chapter } from '@/types/manga';

interface ListReadingModeProps {
  chapter: Chapter;
  imageLoading: { [key: number]: boolean };
  onImageLoad: (index: number) => void;
  onImageError: (index: number) => void;
}

export default function ListReadingMode({
  chapter,
  imageLoading,
  onImageLoad,
  onImageError,
}: ListReadingModeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Modo Lista - Todas as Páginas
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Role para baixo para ver todas as páginas do capítulo
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          💡 Dica: Use a tecla T ou o botão flutuante para voltar ao topo rapidamente
        </p>
      </div>

      {/* Todas as imagens do capítulo */}
      {chapter.imageUrls!.map((imageUrl, index) => (
        <div key={index} className="w-full flex justify-center">
          {imageLoading[index + 1] !== false && (
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Carregando página {index + 1}...</p>
              </div>
            </div>
          )}
          
          <img
            src={imageUrl}
            alt={`Página ${index + 1} do capítulo`}
            className={`max-w-full h-auto rounded-lg shadow-md ${imageLoading[index + 1] !== false ? 'hidden' : ''}`}
            onLoad={() => onImageLoad(index + 1)}
            onError={(e) => {
              onImageError(index + 1);
              // Fallback para imagem quebrada
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center';
              fallback.style.aspectRatio = '3/4';
              fallback.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400">
                  <div class="text-4xl mb-2">📖</div>
                  <p class="text-sm">Página ${index + 1}</p>
                  <p class="text-xs mt-1">Imagem não disponível</p>
                </div>
              `;
              target.parentNode?.appendChild(fallback);
            }}
          />
        </div>
      ))}

      {/* Indicador de fim do capítulo */}
      <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">📖</div>
        <p className="text-gray-600 dark:text-gray-400">
          Fim do Capítulo {chapter.number}
        </p>
      </div>
    </div>
  );
} 