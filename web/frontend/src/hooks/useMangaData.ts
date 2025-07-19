import { useState, useEffect } from 'react';
import { Manga, Category } from '@/types/manga';
import { featuredManga, popularManga, categories } from '@/data/mockData';

export function useMangaData() {
  const [featured, setFeatured] = useState<Manga[]>([]);
  const [popular, setPopular] = useState<Manga[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando chamada de API com delay
    const fetchData = async () => {
      setLoading(true);
      
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setFeatured(featuredManga);
      setPopular(popularManga);
      setCategoriesData(categories);
      setLoading(false);
    };

    fetchData();
  }, []);

  return {
    featured,
    popular,
    categories: categoriesData,
    loading
  };
} 