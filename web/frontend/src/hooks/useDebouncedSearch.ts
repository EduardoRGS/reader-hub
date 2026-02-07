"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseDebouncedSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

interface UseDebouncedSearchReturn<T> {
  results: T[];
  isSearching: boolean;
  error: string | null;
  searchValue: string;
  setSearchValue: (value: string) => void;
  hasSearched: boolean;
  clear: () => void;
}

/**
 * Hook reutilizável para busca com debounce e AbortController.
 *
 * Substitui o padrão repetido de:
 * - useState para searchValue, results, isSearching
 * - useEffect com setTimeout + AbortController
 *
 * Uso:
 * ```tsx
 * const search = useDebouncedSearch<Manga>(
 *   useCallback(async (q, signal) => {
 *     const data = await mangaService.searchMangas(q, 8, 0, undefined, signal);
 *     return data.content;
 *   }, []),
 *   { debounceMs: 300 }
 * );
 * ```
 */
export function useDebouncedSearch<T>(
  searchFn: (query: string, signal: AbortSignal) => Promise<T[]>,
  options: UseDebouncedSearchOptions = {}
): UseDebouncedSearchReturn<T> {
  const { debounceMs = 300, minLength = 2 } = options;

  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const searchFnRef = useRef(searchFn);
  searchFnRef.current = searchFn;

  useEffect(() => {
    const q = searchValue.trim();
    if (q.length < minLength) {
      setResults([]);
      setIsSearching(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await searchFnRef.current(q, controller.signal);
        if (!controller.signal.aborted) {
          setResults(data);
          setIsSearching(false);
          setHasSearched(true);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Error");
          setIsSearching(false);
          setHasSearched(true);
        }
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs, minLength]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    setSearchValue("");
    setResults([]);
    setIsSearching(false);
    setError(null);
    setHasSearched(false);
  }, []);

  return {
    results,
    isSearching,
    error,
    searchValue,
    setSearchValue,
    hasSearched,
    clear,
  };
}
