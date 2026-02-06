"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Flex,
  Text,
  TextField,
  Badge,
  Box,
  Button,
  Callout,
  Spinner,
} from "@radix-ui/themes";
import {
  Search,
  BookOpen,
  Clock,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { formatDate } from "@/lib/utils";
import type { Chapter } from "@/types/manga";
import { useReaderStore } from "@/store/readerStore";
import { usePopulateChapters, useInvalidateMangas } from "@/hooks/queries";
import { useLocale } from "@/hooks/useLocale";
import { CHAPTER_LANGUAGE_MAP } from "@/lib/i18n";

const ROW_HEIGHT = 44;

interface ChapterListProps {
  chapters: Chapter[];
  mangaId: string;
}

export function ChapterList({ chapters, mangaId }: ChapterListProps) {
  const [search, setSearch] = useState("");
  const { readingHistory } = useReaderStore();
  const populateMutation = usePopulateChapters();
  const { invalidateChapters } = useInvalidateMangas();
  const { locale, t } = useLocale();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handlePopulateChapters = useCallback(() => {
    populateMutation.mutate(mangaId, {
      onSuccess: () => invalidateChapters(mangaId),
    });
  }, [populateMutation, mangaId, invalidateChapters]);

  // Filtra capítulos pelo idioma selecionado
  const acceptedLanguages = CHAPTER_LANGUAGE_MAP[locale];

  const filteredByLanguage = useMemo(() => {
    const inLocale = chapters.filter(
      (c) => c.language && acceptedLanguages.includes(c.language.toLowerCase())
    );
    return inLocale.length > 0 ? inLocale : null;
  }, [chapters, acceptedLanguages]);

  // Se não houver capítulos no idioma selecionado, mostra todos
  const chaptersToShow = filteredByLanguage ?? chapters;
  const showingFallback = filteredByLanguage === null && chapters.length > 0;

  const sorted = useMemo(() => {
    const filtered = search.trim()
      ? chaptersToShow.filter(
          (c) =>
            c.number.toString().includes(search) ||
            c.title?.toLowerCase().includes(search.toLowerCase())
        )
      : chaptersToShow;

    return [...filtered].sort((a, b) => b.number - a.number);
  }, [chaptersToShow, search]);

  const lastReadId = useMemo(() => {
    const entry = readingHistory
      .filter((h) => h.mangaId === mangaId)
      .sort(
        (a, b) =>
          new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime()
      )[0];
    return entry?.chapterId ?? null;
  }, [readingHistory, mangaId]);

  // ─── TanStack Virtual ────────────────────────────────────
  const rowVirtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  // Estado vazio: nenhum capítulo
  if (chapters.length === 0) {
    return (
      <Flex direction="column" align="center" gap="3" py="6">
        <BookOpen size={32} style={{ color: "var(--gray-8)" }} />
        <Text size="2" color="gray">
          {t("chapters.empty")}
        </Text>
        <Button
          variant="soft"
          onClick={handlePopulateChapters}
          disabled={populateMutation.isPending}
        >
          {populateMutation.isPending ? (
            <Spinner size="1" />
          ) : (
            <Download size={14} />
          )}
          {populateMutation.isPending
            ? t("chapters.importing")
            : t("chapters.import_mangadex")}
        </Button>

        {populateMutation.data && (
          <Callout.Root
            color={populateMutation.data.status === "success" ? "green" : "red"}
            size="1"
          >
            <Callout.Icon>
              {populateMutation.data.status === "success" ? (
                <CheckCircle size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
            </Callout.Icon>
            <Callout.Text>{populateMutation.data.message}</Callout.Text>
          </Callout.Root>
        )}

        {populateMutation.error && (
          <Callout.Root color="red" size="1">
            <Callout.Icon>
              <AlertCircle size={14} />
            </Callout.Icon>
            <Callout.Text>{populateMutation.error.message}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    );
  }

  const languageLabel =
    locale === "pt-br"
      ? t("chapters.language_pt")
      : t("chapters.language_en");

  return (
    <Flex direction="column" gap="3">
      {/* Aviso de fallback de idioma */}
      {showingFallback && (
        <Callout.Root color="amber" size="1">
          <Callout.Icon>
            <Info size={14} />
          </Callout.Icon>
          <Callout.Text>
            {t("chapters.no_language", { language: languageLabel })}
          </Callout.Text>
        </Callout.Root>
      )}

      <Flex align="center" justify="between" gap="3">
        <TextField.Root
          placeholder={t("chapters.search")}
          size="2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        >
          <TextField.Slot>
            <Search size={14} />
          </TextField.Slot>
        </TextField.Root>
        <Text size="1" color="gray">
          {t("chapters.count", { count: chaptersToShow.length })}
        </Text>
      </Flex>

      {/* Table header */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 100px",
          gap: 8,
          padding: "8px 12px",
          borderBottom: "1px solid var(--gray-a5)",
          fontWeight: 600,
          fontSize: "var(--font-size-1)",
          color: "var(--gray-11)",
        }}
      >
        <span>{t("chapters.col_number")}</span>
        <span>{t("chapters.col_title")}</span>
        <Box display={{ initial: "none", sm: "block" }}>
          <span>{t("chapters.col_date")}</span>
        </Box>
      </Box>

      {/* Virtualized list */}
      <div
        ref={scrollContainerRef}
        style={{
          height: Math.min(sorted.length * ROW_HEIGHT, 500),
          overflow: "auto",
        }}
        className="no-scrollbar"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const chapter = sorted[virtualRow.index];
            const isLastRead = lastReadId === chapter.id;
            return (
              <Link
                key={chapter.id}
                href={`/manga/${mangaId}/chapter/${chapter.id}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Box
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 100px",
                    gap: 8,
                    alignItems: "center",
                    height: "100%",
                    padding: "0 12px",
                    borderRadius: "var(--radius-2)",
                    background: isLastRead ? "var(--accent-a3)" : undefined,
                    transition: "background 0.15s",
                  }}
                  className="hover:bg-[var(--gray-a3)]"
                >
                  <Flex align="center" gap="2">
                    <Text size="2" weight="medium">
                      {chapter.number}
                    </Text>
                    {isLastRead && (
                      <Badge size="1" color="iris" variant="soft">
                        <Clock size={10} />
                        {t("chapters.last_read")}
                      </Badge>
                    )}
                  </Flex>
                  <Text size="2" color="gray" truncate>
                    {chapter.title ||
                      t("chapters.chapter_n", { number: chapter.number })}
                  </Text>
                  <Box display={{ initial: "none", sm: "block" }}>
                    <Text size="1" color="gray">
                      {formatDate(chapter.releaseDate, locale)}
                    </Text>
                  </Box>
                </Box>
              </Link>
            );
          })}
        </div>
      </div>
    </Flex>
  );
}
