import { useCategories as useCategoriesQuery } from './queries';

export const useCategories = () => {
  const { data: categories = [], isLoading: loading, error, refetch: retry } = useCategoriesQuery();

  return {
    categories,
    loading,
    error: error instanceof Error ? error.message : null,
    retry
  };
}; 