'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header, Footer } from '@/components';
import { Manga, Chapter } from '@/types/manga';
import { getMangaById, getChaptersByMangaId } from '@/services/api';

export default function MangaPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;
  
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMangaData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar dados do mangá
        const mangaData = await getMangaById(mangaId);
        setManga(mangaData);
        
        // Buscar capítulos do mangá
        const chaptersData = await getChaptersByMangaId(mangaId);
        setChapters(chaptersData);
      } catch (err) {
        setError('Erro ao carregar dados do mangá');
        console.error('Erro ao buscar mangá:', err);
      } finally {
        setLoading(false);
      }
    };

    if (mangaId) {
      fetchMangaData();
    }
  }, [mangaId]);

  const handleChapterClick = (chapter: Chapter) => {
    router.push(`/manga/${mangaId}/chapter/${chapter.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando mangá...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Mangá não encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || 'O mangá que você está procurando não existe.'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const title = manga.title?.['pt-br'] || manga.title?.['en'] || 'Título não disponível';
  const description = manga.description?.['pt-br'] || manga.description?.['en'] || 'Descrição não disponível';
  
  const statusMap = {
    'ongoing': 'Em andamento',
    'completed': 'Concluído',
    'hiatus': 'Em pausa',
    'cancelled': 'Cancelado'
  };
  const status = statusMap[manga.status] || manga.status;
  const rating = manga.rating ? manga.rating.toFixed(1) : 'N/A';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section com capa e informações principais */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Capa do mangá */}
            <div className="lg:col-span-1">
              <div className="relative group">
                <img
                  src={manga.coverImage}
                  alt={title}
                  className="w-full max-w-sm mx-auto rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-manga.jpg';
                  }}
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Informações do mangá */}
            <div className="lg:col-span-2 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  manga.status === 'completed' ? 'bg-green-500 text-white' :
                  manga.status === 'ongoing' ? 'bg-blue-500 text-white' :
                  manga.status === 'hiatus' ? 'bg-yellow-500 text-black' :
                  'bg-red-500 text-white'
                }`}>
                  {status}
                </span>
                {manga.year && (
                  <span className="px-3 py-1 text-sm bg-white/20 rounded-full">
                    {manga.year}
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {title}
              </h1>

              {manga.author && (
                <p className="text-xl text-gray-300 mb-4">
                  Por <span className="font-semibold">{manga.author.name}</span>
                </p>
              )}

              <div className="flex items-center gap-6 mb-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="font-semibold">{rating}</span>
                  {manga.ratingCount && (
                    <span className="text-sm">({manga.ratingCount} avaliações)</span>
                  )}
                </div>
                {manga.views && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">👁️</span>
                    <span>{manga.views.toLocaleString()} visualizações</span>
                  </div>
                )}
                {manga.follows && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">❤️</span>
                    <span>{manga.follows.toLocaleString()} seguidores</span>
                  </div>
                )}
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Sinopse</h3>
                <p className="text-gray-200 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Capítulos */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Capítulos
            </h2>
            <div className="text-gray-600 dark:text-gray-300">
              {chapters.length} capítulo{chapters.length !== 1 ? 's' : ''} disponível{chapters.length !== 1 ? 'is' : ''}
            </div>
          </div>

          {chapters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer group"
                  onClick={() => handleChapterClick(chapter)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Capítulo {chapter.number}
                    </h3>
                    {chapter.isRead && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                        Lido
                      </span>
                    )}
                  </div>
                  
                  {chapter.title && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {chapter.title}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{chapter.pages || 0} páginas</span>
                    {chapter.releaseDate && (
                      <span>{new Date(chapter.releaseDate).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum capítulo disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Os capítulos serão adicionados em breve.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}