'use client';

import { useRouter } from 'next/navigation';
import { MangaCardProps } from '@/types/manga';
import { usePrefetch } from '@/hooks/usePrefetch';
import Image from 'next/image';

export default function MangaCard({ manga, variant = 'featured' }: MangaCardProps) {
  const router = useRouter();
  const { prefetchManga } = usePrefetch();
  
  // Função para iniciar o prefetch quando o usuário passa o mouse sobre o card
  const handleMouseEnter = () => {
    prefetchManga(manga.id);
  };
  const title = manga.title?.['pt-br'] || manga.title?.['en'] || 'Título não disponível';
  
  const chapterInfo = manga.totalChapters 
    ? `Capítulo ${manga.totalChapters}` 
    : manga.chapter || 'Capítulos não disponíveis';
  
  // Formatar rating
  const rating = manga.rating ? manga.rating.toFixed(1) : 'N/A';
  
  // Status em português
  const statusMap = {
    'ongoing': 'Em andamento',
    'completed': 'Concluído',
    'hiatus': 'Em pausa',
    'cancelled': 'Cancelado'
  };
  const status = statusMap[manga.status] || manga.status;
  const imageUrl = manga.coverImage;

  const handleClick = () => {
    router.push(`/manga/${manga.id}`);
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
        variant === 'featured' ? 'h-80' : 'h-64'
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Imagem de fundo */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl || '/placeholder-manga.jpg'}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          priority={variant === 'featured'}
        />
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col justify-end h-full p-4">
        {/* Badge de status */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            manga.status === 'completed' ? 'bg-green-500 text-white' :
            manga.status === 'ongoing' ? 'bg-blue-500 text-white' :
            manga.status === 'hiatus' ? 'bg-yellow-500 text-black' :
            'bg-red-500 text-white'
          }`}>
            {status}
          </span>
        </div>

        {/* Informações do manga */}
        <div>
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
            {title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-gray-200">
            <span>{chapterInfo}</span>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span>{rating}</span>
            </div>
          </div>

          {/* Informações adicionais para featured */}
          {variant === 'featured' && (
            <div className="mt-2 text-xs text-gray-300">
              <p>Ano: {manga.year || 'N/A'}</p>
              {manga.author && (
                <p>Autor: {manga.author.name}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}