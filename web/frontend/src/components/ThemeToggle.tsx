'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    
    const savedTheme = localStorage.getItem('reader-preferences');
    let theme: 'light' | 'dark' = 'light';
    
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        theme = parsed.state?.themeMode || 'light';
      } catch {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = systemPrefersDark ? 'dark' : 'light';
      }
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = systemPrefersDark ? 'dark' : 'light';
    }
    
    setCurrentTheme(theme);
    
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--background', '#0a0a0a');
      root.style.setProperty('--foreground', '#ededed');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#171717');
    }
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <span className="text-lg">💻</span>
      </button>
    );
  }

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--background', '#0a0a0a');
      root.style.setProperty('--foreground', '#ededed');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#171717');
    }
    
    const savedPreferences = localStorage.getItem('reader-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        parsed.state.themeMode = newTheme;
        localStorage.setItem('reader-preferences', JSON.stringify(parsed));
      } catch {
        const newPreferences = {
          state: { themeMode: newTheme },
          version: 0
        };
        localStorage.setItem('reader-preferences', JSON.stringify(newPreferences));
      }
    } else {
      const newPreferences = {
        state: { themeMode: newTheme },
        version: 0
      };
      localStorage.setItem('reader-preferences', JSON.stringify(newPreferences));
    }
    
    setCurrentTheme(newTheme);
  };

  const themeIcon = currentTheme === 'light' ? '☀️' : '🌙';
  const themeLabel = currentTheme === 'light' ? 'Modo claro' : 'Modo escuro';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={`Alternar para ${currentTheme === 'light' ? 'modo escuro' : 'modo claro'}`}
      aria-label={themeLabel}
    >
      <span className="text-lg">{themeIcon}</span>
    </button>
  );
}