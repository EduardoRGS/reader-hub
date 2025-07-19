import { MangaCardProps } from '@/types/manga';

export default function MangaCard({ manga, variant = 'featured', index }: MangaCardProps) {
  if (variant === 'popular') {
    return (
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-[3/4] mb-3">
          <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
            <span className="text-gray-500 text-xs text-center px-2">Capa do Mangá</span>
          </div>
          {typeof index === 'number' && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              #{index + 1}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
        </div>
        <h4 className="font-medium text-sm text-foreground mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {manga.title}
        </h4>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{manga.chapter}</span>
          <span>⭐ {manga.rating}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-[3/4] mb-4">
        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Capa do Mangá</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
          ⭐ {manga.rating}
        </div>
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <p className="text-xs text-gray-600 dark:text-gray-300">{manga.chapter}</p>
        </div>
      </div>
      <h4 className="font-semibold text-foreground mb-1 group-hover:text-blue-600 transition-colors">
        {manga.title}
      </h4>
      {manga.genres && (
        <div className="flex flex-wrap gap-1">
          {manga.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
              {genre}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 