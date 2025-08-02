'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, User, Menu, BookOpen, Heart, TrendingUp, Grid3X3 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fechar menu mobile quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('header')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reader Hub
          </h1>
        </Link>
        
        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
            <BookOpen className="w-4 h-4" />
            <span>Início</span>
          </Link>
          <Link href="/library" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
            <Grid3X3 className="w-4 h-4" />
            <span>Biblioteca</span>
          </Link>
          <Link href="/popular" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span>Populares</span>
          </Link>
          <Link href="/favorites" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
            <Heart className="w-4 h-4" />
            <span>Favoritos</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Barra de pesquisa - Desktop */}
          <div className="hidden sm:block relative">
            <Input
              type="text"
              placeholder="Buscar mangás..."
              className="w-64 pl-4 pr-10"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Seletor de tema */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          
          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative h-8 w-8 rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Usuário</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    usuario@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem>
                Histórico de leitura
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botão do menu mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden h-8 w-8 p-0"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-background/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-4">
            {/* Barra de pesquisa - Mobile */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar mangás..."
                className="w-full pl-4 pr-10"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Seletor de tema - Mobile */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            
            {/* Links de navegação - Mobile */}
            <div className="space-y-2">
              <Link 
                href="/" 
                className="flex items-center space-x-3 px-4 py-3 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                <span>Início</span>
              </Link>
              <Link 
                href="/library" 
                className="flex items-center space-x-3 px-4 py-3 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Grid3X3 className="w-5 h-5" />
                <span>Biblioteca</span>
              </Link>
              <Link 
                href="/popular" 
                className="flex items-center space-x-3 px-4 py-3 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Populares</span>
              </Link>
              <Link 
                href="/favorites" 
                className="flex items-center space-x-3 px-4 py-3 text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart className="w-5 h-5" />
                <span>Favoritos</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}