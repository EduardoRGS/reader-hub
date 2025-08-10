'use client';

import { useState } from 'react';
import { useInfiniteMangas } from './queries';

export function useLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');

  const itemsPerPage = 20;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteMangas(statusFilter, itemsPerPage);

  const allMangas = data?.pages.flatMap(page => page.content || []) || [];
  
  const filteredMangas = allMangas.filter(manga => {
    if (!searchTerm) return true;
    
    const title = manga.title?.['pt-br'] || manga.title?.['en'] || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = data?.pages[0]?.totalPages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const goToPage = () => {
    refetch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    refetch();
  };

  const getStats = () => {
    return {
      total: allMangas.length,
      completed: allMangas.filter(m => m.status === 'completed').length,
      ongoing: allMangas.filter(m => m.status === 'ongoing').length,
      hiatus: allMangas.filter(m => m.status === 'hiatus').length,
      cancelled: allMangas.filter(m => m.status === 'cancelled').length,
      pages: totalPages,
    };
  };

  return {
    mangas: allMangas,
    loading: isLoading,
    error: isError ? (error instanceof Error ? error.message : 'Erro desconhecido') : null,
    currentPage: 1,
    totalPages,
    searchTerm,
    statusFilter,
    sortBy,
    filteredMangas,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleSearch,
    goToPage,
    resetFilters,
    getStats,
    refetch,
    setSearchTerm,
    setStatusFilter,
    setSortBy,
  };
}