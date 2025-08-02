'use client';

import { Header, Footer, MangaCard } from '@/components';
import { LibraryStats, LibraryFilters, Pagination } from '@/components/library';
import { useLibrary } from '@/hooks/useLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, RefreshCw } from 'lucide-react';

export default function LibraryPage() {
  const {
    loading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    statusFilter,
    filteredMangas,
    refetch,
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
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Carregando biblioteca</h3>
              <p className="text-muted-foreground">
                Aguarde enquanto carregamos os mangás...
              </p>
            </CardContent>
          </Card>
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
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl mb-2">
                Erro ao carregar biblioteca
              </CardTitle>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={() => refetch()} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Filtros e Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <LibraryFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onSearchSubmit={handleSearch}
            />

            {/* Estatísticas */}
            <LibraryStats stats={stats} />
          </CardContent>
        </Card>

        {/* Grid de Mangás */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-sm mx-4">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
                <p className="text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
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
          <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">
                  Nenhum mangá encontrado
                </CardTitle>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `Nenhum mangá encontrado para "${searchTerm}"`
                    : 'Não há mangás disponíveis no momento.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}