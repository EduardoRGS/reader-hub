import { Header, HeroSection, MangaCard, CategoryCard, Footer } from '@/components';
import { featuredManga, popularManga, categories } from '@/data/mockData';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <HeroSection />

      {/* Featured Manga Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-foreground">Mangás em Destaque</h3>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Ver todos →</a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredManga.map((manga) => (
              <MangaCard key={manga.id} manga={manga} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Manga Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-foreground">Populares da Semana</h3>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Ver ranking completo →</a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularManga.map((manga, index) => (
              <MangaCard key={manga.id} manga={manga} variant="popular" index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Explore por Categoria</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Encontre exatamente o tipo de história que você está procurando. 
              Temos mangás para todos os gostos e idades.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">15,000+</div>
              <div className="text-white/80">Mangás Disponíveis</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500K+</div>
              <div className="text-white/80">Leitores Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-white/80">Capítulos Lidos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-white/80">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
