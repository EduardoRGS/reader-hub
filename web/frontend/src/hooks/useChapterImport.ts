"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { adminService } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queries";

export interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
}

export function useChapterImport() {
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const qc = useQueryClient();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const startImport = useCallback(
    async (mangaId: string) => {
      setIsImporting(true);
      setError(null);
      setProgress(null);

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        await adminService.populateChaptersStream(
          mangaId,
          (data) => setProgress(data),
          abortController.signal
        );
        qc.invalidateQueries({ queryKey: queryKeys.stats() });
        qc.invalidateQueries({ queryKey: queryKeys.chapters(mangaId) });
      } catch (e: unknown) {
        // Ignorar erros de cancelamento (AbortError / AbortController)
        const isAbort =
          (e instanceof DOMException && e.name === "AbortError") ||
          (e instanceof Error && e.name === "AbortError");
        if (!isAbort) {
          setError(e instanceof Error ? e.message : "Import failed");
        }
      } finally {
        setIsImporting(false);
        abortRef.current = null;
      }
    },
    [qc]
  );

  const cancelImport = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { progress, isImporting, error, startImport, cancelImport };
}
