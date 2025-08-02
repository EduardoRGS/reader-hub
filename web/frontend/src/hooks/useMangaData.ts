import { useFeaturedMangas, usePopularMangas } from './queries';

export const useMangaData = () => {
  const featuredQuery = useFeaturedMangas();
  const popularQuery = usePopularMangas();

  const isLoading = featuredQuery.isLoading || popularQuery.isLoading;
  const isError = featuredQuery.isError || popularQuery.isError;
  
  const error = featuredQuery.error || popularQuery.error;
  const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

  const retry = () => {
    featuredQuery.refetch();
    popularQuery.refetch();
  };

  return {
    featuredManga: featuredQuery.data || [],
    popularManga: popularQuery.data || [],
    loading: isLoading,
    error: isError ? errorMessage : null,
    retry,
    retryCount: 0,
  };
};