'use client';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reader Hub
          </h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-foreground hover:text-blue-600 transition-colors">Início</a>
          <a href="#" className="text-foreground hover:text-blue-600 transition-colors">Biblioteca</a>
          <a href="#" className="text-foreground hover:text-blue-600 transition-colors">Populares</a>
          <a href="#" className="text-foreground hover:text-blue-600 transition-colors">Categorias</a>
          <a href="#" className="text-foreground hover:text-blue-600 transition-colors">Favoritos</a>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:block relative">
            <input
              type="text"
              placeholder="Buscar mangás..."
              className="w-64 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
} 