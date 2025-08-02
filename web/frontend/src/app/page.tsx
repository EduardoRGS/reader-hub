'use client';

import { Header, HeroSection, MangaCard, CategoryCard, Footer, ErrorMessage } from '@/components';
import { MangaCardSkeleton } from '@/components/MangaCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMangaData } from '@/hooks/useMangaData';
import { useCategories } from '@/hooks/useCategories';

export default function Home() {
  const { featuredManga, popularManga, loading: mangaLoading, error: mangaError, retry: retryManga } = useMangaData();
  const { categories, loading: categoriesLoading, error: categoriesError, retry: retryCategories } = useCategories();

  const loading = mangaLoading || categoriesLoading;
  const error = mangaError || categoriesError;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <HeroSection />
        
        {/* Skeleton para Mangás em Destaque */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Mangás em Destaque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, index) => (
                <MangaCardSkeleton key={index} variant="featured" />
              ))}
            </div>
          </div>
        </section>

        {/* Skeleton para Categorias */}
        <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Categorias
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array(12).fill(0).map((_, index) => (
                <Skeleton 
                  key={index}
                  className="h-24 rounded-lg"
                  animation="pulse"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Skeleton para Mangás Populares */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Mangás Populares
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
                <MangaCardSkeleton key={index} variant="popular" />
              ))}
            </div>
          </div>
        </section>
        
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
            <ErrorMessage 
              error={error} 
              onRetry={retryManga}
            />
            {categoriesError && (
              <div className="mt-4">
                <button
                  onClick={() => retryCategories()}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Recarregar categorias
                </button>
              </div>
            )}
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
