import { useState, useEffect } from 'react';
import { mangaService, Category } from '@/services/api';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriesData = await mangaService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const retry = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    retry
  };
}; 