'use client';

import { Header, Footer, MangaCard } from '@/components';
import { LibraryStats, LibraryFilters, Pagination } from '@/components/library';
import { useLibrary } from '@/hooks/useLibrary';

export default function LibraryPage() {
  const {
    loading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    statusFilter,
    filteredMangas,
    fetchMangas,
    handleSearch,
    goToPage,
    getStats,
    setSearchTerm,
    setStatusFilter,
  } = useLibrary();

  const stats = getStats();

  if (loading && filteredMangas.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando biblioteca...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && filteredMangas.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Erro ao carregar biblioteca
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <button
              onClick={fetchMangas}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header da Biblioteca */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Biblioteca</h1>
          <p className="text-xl opacity-90">
            Explore nossa coleção completa de mangás
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <LibraryFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onSearchSubmit={handleSearch}
          />

          {/* Estatísticas */}
          <div className="mt-6">
            <LibraryStats stats={stats} />
          </div>
        </div>

        {/* Grid de Mangás */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
            </div>
          </div>
        ) : filteredMangas.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMangas.map((manga, index) => (
                <MangaCard 
                  key={manga.id} 
                  manga={manga} 
                  index={index} 
                />
              ))}
            </div>

            {/* Paginação */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum mangá encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm 
                ? `Nenhum mangá encontrado para "${searchTerm}"`
                : 'Não há mangás disponíveis no momento.'
              }
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
} 