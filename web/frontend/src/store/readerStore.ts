import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ReadingMode = 'default' | 'webtoon';
type ThemeMode = 'light' | 'dark';

interface ReadingProgress {
  mangaId: string;
  chapterId: string;
  page: number;
  lastRead: string; // Mudança: usar string ao invés de Date para melhor serialização
}

interface ReadingHistoryEntry {
  mangaId: string;
  chapterId: string;
  page: number;
  lastRead: string;
}

interface ReaderState {
  readingMode: 'default' | 'webtoon';
  themeMode: ThemeMode;
  autoAdvance: boolean;
  autoNextChapter: boolean;
  showPageNumber: boolean;
  readingHistory: ReadingHistoryEntry[];
  isHydrated: boolean;
  setReadingMode: (mode: ReadingMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAutoAdvance: (auto: boolean) => void;
  setAutoNextChapter: (auto: boolean) => void;
  setShowPageNumber: (show: boolean) => void;
  addToHistory: (progress: Omit<ReadingProgress, 'lastRead'>) => void;
  updateReadingProgress: (progress: Omit<ReadingProgress, 'lastRead'>) => void;
  getLastReadChapter: (mangaId: string) => ReadingProgress | undefined;
  clearReadingHistory: () => void;
  setIsHydrated: (hydrated: boolean) => void;
}

const getSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const initialState: Omit<ReaderState, 'setReadingMode' | 'setThemeMode' | 'setAutoAdvance' | 'setAutoNextChapter' | 'setShowPageNumber' | 'addToHistory' | 'updateReadingProgress' | 'getLastReadChapter' | 'clearReadingHistory' | 'setIsHydrated'> = {
  readingMode: 'default',
  themeMode: getSystemTheme(),
  autoAdvance: false,
  autoNextChapter: false,
  showPageNumber: true,
  readingHistory: [],
  isHydrated: false,
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setIsHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
      
      setReadingMode: (mode) => set({ readingMode: mode }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setAutoAdvance: (auto) => set({ autoAdvance: auto }),
      setAutoNextChapter: (auto) => set({ autoNextChapter: auto }),
      setShowPageNumber: (show) => set({ showPageNumber: show }),
      
      addToHistory: (progress) => {
        const { mangaId, chapterId, page } = progress;
        set((state) => {
          const filteredHistory = state.readingHistory.filter(
            (item) => !(item.mangaId === mangaId && item.chapterId === chapterId)
          );
          
          return {
            readingHistory: [
              ...filteredHistory,
              { mangaId, chapterId, page, lastRead: new Date().toISOString() },
            ].slice(-100),
          };
        });
      },
      
      updateReadingProgress: (progress) => {
        const { mangaId, chapterId, page } = progress;
        set((state) => {
          const filteredHistory = state.readingHistory.filter(
            (item) => !(item.mangaId === mangaId && item.chapterId === chapterId)
          );
          
          return {
            readingHistory: [
              ...filteredHistory,
              { mangaId, chapterId, page, lastRead: new Date().toISOString() },
            ].slice(-100),
          };
        });
      },
      
      getLastReadChapter: (mangaId) => {
        const { readingHistory } = get();
        const mangaHistory = readingHistory
          .filter((item) => item.mangaId === mangaId)
          .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime());
        
        return mangaHistory[0];
      },
      
      clearReadingHistory: () => set({ readingHistory: [] }),
    }),
    {
      name: 'reader-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        readingMode: state.readingMode,
        themeMode: state.themeMode,
        autoAdvance: state.autoAdvance,
        autoNextChapter: state.autoNextChapter,
        showPageNumber: state.showPageNumber,
        readingHistory: state.readingHistory,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && (state.readingMode as string) === 'list') {
          state.readingMode = 'webtoon';
        }
        state?.setIsHydrated(true);
      },
    }
  )
);