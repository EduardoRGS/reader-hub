'use client';

import { useState, useEffect } from 'react';
import { Manga, PaginatedResponse } from '@/types/manga';
import { mangaService } from '@/services/api';

export function useLibrary() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');

  const itemsPerPage = 20;

  useEffect(() => {
    fetchMangas();
  }, [currentPage, statusFilter, sortBy]);

  const fetchMangas = async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * itemsPerPage;
      let response: PaginatedResponse<Manga>;

      if (statusFilter !== 'all') {
        response = await mangaService.getMangasByStatus(statusFilter, itemsPerPage, offset);
      } else {
        response = await mangaService.getMangas(itemsPerPage, offset);
      }

      setMangas(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError('Erro ao carregar mangás da biblioteca');
      console.error('Erro ao buscar mangás:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar busca quando necessário
    console.log('Buscar por:', searchTerm);
  };

  const filteredMangas = mangas.filter(manga => {
    if (!searchTerm) return true;
    
    const title = manga.title?.['pt-br'] || manga.title?.['en'] || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const getStats = () => {
    return {
      total: mangas.length,
      completed: mangas.filter(m => m.status === 'completed').length,
      ongoing: mangas.filter(m => m.status === 'ongoing').length,
      hiatus: mangas.filter(m => m.status === 'hiatus').length,
      cancelled: mangas.filter(m => m.status === 'cancelled').length,
      pages: totalPages,
    };
  };

  return {
    // Estados
    mangas,
    loading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    statusFilter,
    sortBy,
    filteredMangas,
    
    // Funções
    fetchMangas,
    handleSearch,
    goToPage,
    resetFilters,
    getStats,
    
    // Setters
    setSearchTerm,
    setStatusFilter,
    setSortBy,
    setCurrentPage,
  };
} 