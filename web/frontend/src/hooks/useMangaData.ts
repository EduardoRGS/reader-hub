import { useState, useEffect } from 'react';
import { Manga } from '@/types/manga';
import { mangaService } from '@/services/api';

export const useMangaData = () => {
  const [featuredMangaData, setFeaturedMangaData] = useState<Manga[]>([]);
  const [popularMangaData, setPopularMangaData] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchMangaData = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar mangás em destaque e populares em paralelo
      const [featured, popular] = await Promise.all([
        mangaService.getFeaturedMangas(4),
        mangaService.getPopularMangas(6)
      ]);

      setFeaturedMangaData(featured);
      setPopularMangaData(popular);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Erro ao buscar dados dos mangás:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      
      // Se não for uma tentativa de retry e ainda não tentamos 3 vezes, tentar novamente
      if (!isRetry && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchMangaData(true);
        }, 2000); // Aguardar 2 segundos antes de tentar novamente
        return;
      }
      
      // Se todas as tentativas falharam, mostrar erro
      if (retryCount >= 3) {
        setError('Não foi possível carregar os dados. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangaData();
  }, []);

  const retry = () => {
    setRetryCount(0);
    fetchMangaData();
  };

  return {
    featuredManga: featuredMangaData,
    popularManga: popularMangaData,
    loading,
    error,
    retry,
    retryCount
  };
}; 