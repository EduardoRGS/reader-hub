'use client';

import { Header, HeroSection, MangaCard, CategoryCard, Footer } from '@/components';
import { useMangaData } from '@/hooks/useMangaData';
import { useCategories } from '@/hooks/useCategories';

export default function Home() {
  const { featuredManga, popularManga, loading: mangaLoading, error: mangaError, retry: retryManga, retryCount } = useMangaData();
  const { categories, loading: categoriesLoading, error: categoriesError, retry: retryCategories } = useCategories();

  const loading = mangaLoading || categoriesLoading;
  const error = mangaError || categoriesError;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {retryCount > 0 ? `Tentativa ${retryCount} de 3...` : 'Carregando...'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Erro ao carregar
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <div className="space-x-4">
              <button
                onClick={retryManga}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
              {categoriesError && (
                <button
                  onClick={retryCategories}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Recarregar categorias
                </button>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Seção de Mangás em Destaque */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Mangás em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredManga.map((manga, index) => (
              <MangaCard 
                key={manga.id} 
                manga={manga} 
                variant="featured" 
                index={index} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Categorias */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Categorias
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Mangás Populares */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Mangás Populares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularManga.map((manga, index) => (
              <MangaCard 
                key={manga.id} 
                manga={manga} 
                variant="popular" 
                index={index} 
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
