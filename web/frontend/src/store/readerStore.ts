import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Locale } from "@/lib/i18n";

type ReadingMode = "default" | "webtoon";

interface ReadingProgress {
  mangaId: string;
  chapterId: string;
  page: number;
  lastRead: string;
}

export interface SliderManga {
  id: string;
  title: Record<string, string | undefined>;
  description?: Record<string, string | undefined>;
  coverImage?: string;
  author?: string;
  rating?: number;
  status?: string;
}

interface ReaderState {
  locale: Locale;
  readingMode: ReadingMode;
  autoNextChapter: boolean;
  showPageNumber: boolean;
  readingHistory: ReadingProgress[];
  sliderMangas: SliderManga[];

  setLocale: (locale: Locale) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setAutoNextChapter: (v: boolean) => void;
  setShowPageNumber: (v: boolean) => void;

  updateReadingProgress: (
    p: Omit<ReadingProgress, "lastRead">
  ) => void;
  getLastReadChapter: (
    mangaId: string
  ) => ReadingProgress | undefined;
  clearReadingHistory: () => void;

  addSliderManga: (manga: SliderManga) => void;
  removeSliderManga: (id: string) => void;
  reorderSliderMangas: (mangas: SliderManga[]) => void;
}

/**
 * Locale padrão usado no SSR e na primeira renderização do cliente.
 * Após a montagem, o Zustand persist reidrata do localStorage,
 * sobrescrevendo com o valor salvo pelo usuário (se houver).
 */
const DEFAULT_LOCALE: Locale = "pt-br";

/**
 * Detecta o idioma preferido do navegador.
 * Usado apenas quando não há locale salvo no localStorage.
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("pt")) return "pt-br";
  return "en";
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      readingMode: "default",
      autoNextChapter: true,
      showPageNumber: true,
      readingHistory: [],
      sliderMangas: [],

      setLocale: (locale) => set({ locale }),
      setReadingMode: (mode) => set({ readingMode: mode }),
      setAutoNextChapter: (v) => set({ autoNextChapter: v }),
      setShowPageNumber: (v) => set({ showPageNumber: v }),

      updateReadingProgress: ({ mangaId, chapterId, page }) => {
        set((state) => {
          const filtered = state.readingHistory.filter(
            (h) => !(h.mangaId === mangaId && h.chapterId === chapterId)
          );
          return {
            readingHistory: [
              ...filtered,
              {
                mangaId,
                chapterId,
                page,
                lastRead: new Date().toISOString(),
              },
            ].slice(-100),
          };
        });
      },

      getLastReadChapter: (mangaId) => {
        return get()
          .readingHistory.filter((h) => h.mangaId === mangaId)
          .sort(
            (a, b) =>
              new Date(b.lastRead).getTime() -
              new Date(a.lastRead).getTime()
          )[0];
      },

      clearReadingHistory: () => set({ readingHistory: [] }),

      addSliderManga: (manga) =>
        set((state) => {
          if (state.sliderMangas.some((m) => m.id === manga.id)) return state;
          return { sliderMangas: [...state.sliderMangas, manga] };
        }),

      removeSliderManga: (id) =>
        set((state) => ({
          sliderMangas: state.sliderMangas.filter((m) => m.id !== id),
        })),

      reorderSliderMangas: (mangas) => set({ sliderMangas: mangas }),
    }),
    {
      name: "reader-hub-preferences",
      storage: createJSONStorage(() => localStorage),
      // Não reidratar automaticamente do localStorage.
      // Isso evita hydration mismatch: o servidor renderiza com DEFAULT_LOCALE
      // e o cliente também usa DEFAULT_LOCALE na primeira renderização.
      // A reidratação é disparada manualmente no Providers após a montagem.
      skipHydration: true,
      partialize: (state) => ({
        locale: state.locale,
        readingMode: state.readingMode,
        autoNextChapter: state.autoNextChapter,
        showPageNumber: state.showPageNumber,
        readingHistory: state.readingHistory,
        sliderMangas: state.sliderMangas,
      }),
    }
  )
);
