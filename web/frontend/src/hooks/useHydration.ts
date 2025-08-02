'use client';

import { useEffect, useState } from 'react';
import { useReaderStore } from '@/store/readerStore';

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  const hasHydrated = useReaderStore((state) => state.isHydrated);

  useEffect(() => {
    setHydrated(hasHydrated);
  }, [hasHydrated]);

  return hydrated;
}

// Hook para usar o store apenas após hidratação
export function useReaderStoreHydrated() {
  const hydrated = useHydration();
  const store = useReaderStore();

  if (!hydrated) {
    // Retorna valores padrão durante a hidratação
    return {
      ...store,
      readingMode: 'default' as const,
      themeMode: 'light' as const,
      autoNextChapter: true,
      showPageNumber: true,
      readingHistory: [],
    };
  }

  return store;
}