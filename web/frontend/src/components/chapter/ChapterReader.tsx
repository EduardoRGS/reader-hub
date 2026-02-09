"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flex,
  Text,
  Button,
  IconButton,
  Select,
  Dialog,
  Switch,
  Box,
  Separator,
  SegmentedControl,
  Badge,
  Tooltip,
} from "@radix-ui/themes";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Settings,
  ArrowUp,
  BookOpen,
  Columns2,
  Rows3,
  Keyboard,
} from "lucide-react";
import { useReaderStore } from "@/store/readerStore";
import { chapterService } from "@/services/api";
import { useLocale } from "@/hooks/useLocale";
import type { Chapter } from "@/types/manga";

interface ChapterReaderProps {
  chapter: Chapter;
  chapters: Chapter[];
  mangaId: string;
}

export function ChapterReader({
  chapter,
  chapters,
  mangaId,
}: ChapterReaderProps) {
  const router = useRouter();
  const { t } = useLocale();
  const {
    readingMode,
    setReadingMode,
    autoNextChapter,
    setAutoNextChapter,
    showPageNumber,
    setShowPageNumber,
    updateReadingProgress,
    getLastReadChapter,
  } = useReaderStore();

  // Restaurar progresso salvo ao abrir o capítulo
  const savedProgress = getLastReadChapter(mangaId);
  const initialPage =
    savedProgress?.chapterId === chapter.id ? savedProgress.page : 0;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const webtoonRef = useRef<HTMLDivElement>(null);

  const images = chapter.imageUrls ?? [];
  const totalPages = images.length;

  // Resetar estado ao trocar de capítulo
  useEffect(() => {
    setImageErrors(new Set());
    setScrollProgress(0);
    const progress = getLastReadChapter(mangaId);
    const page = progress?.chapterId === chapter.id ? progress.page : 0;
    setCurrentPage(Math.min(page, Math.max(0, (chapter.imageUrls?.length ?? 1) - 1)));
  }, [chapter.id, mangaId, getLastReadChapter, chapter.imageUrls?.length]);

  const sorted = [...chapters].sort((a, b) => a.number - b.number);
  const currentIdx = sorted.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const nextChapter =
    currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  useEffect(() => {
    chapterService.trackView(chapter.id);
  }, [chapter.id]);

  useEffect(() => {
    if (chapter.id && mangaId) {
      updateReadingProgress({ mangaId, chapterId: chapter.id, page: currentPage });
    }
  }, [chapter.id, mangaId, currentPage, updateReadingProgress]);

  const goNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else if (autoNextChapter && nextChapter) {
      router.push(`/manga/${mangaId}/chapter/${nextChapter.id}`);
    }
  }, [currentPage, totalPages, autoNextChapter, nextChapter, mangaId, router]);

  const goPrevPage = useCallback(() => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  }, [currentPage]);

  const goNextChapter = useCallback(() => {
    if (nextChapter) router.push(`/manga/${mangaId}/chapter/${nextChapter.id}`);
  }, [nextChapter, mangaId, router]);

  const goPrevChapter = useCallback(() => {
    if (prevChapter) router.push(`/manga/${mangaId}/chapter/${prevChapter.id}`);
  }, [prevChapter, mangaId, router]);

  // Toggle de modo de leitura
  const toggleMode = useCallback(() => {
    const newMode = readingMode === "default" ? "webtoon" : "default";
    setReadingMode(newMode);
    // Ao trocar para webtoon, scroll para o topo
    if (newMode === "webtoon") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [readingMode, setReadingMode]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      switch (e.key) {
        case "ArrowRight":
          if (e.ctrlKey || e.metaKey) goNextChapter();
          else if (readingMode === "default") goNextPage();
          break;
        case "ArrowLeft":
          if (e.ctrlKey || e.metaKey) goPrevChapter();
          else if (readingMode === "default") goPrevPage();
          break;
        case "ArrowDown":
          if (readingMode === "default") goNextPage();
          break;
        case "ArrowUp":
          if (readingMode === "default") goPrevPage();
          break;
        case "Home":
          setCurrentPage(0);
          break;
        case "End":
          setCurrentPage(Math.max(0, totalPages - 1));
          break;
        case "Escape":
          router.push(`/manga/${mangaId}`);
          break;
        case "m":
        case "M":
          toggleMode();
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [readingMode, goNextPage, goPrevPage, goNextChapter, goPrevChapter, totalPages, mangaId, router, toggleMode]);

  useEffect(() => {
    if (readingMode !== "webtoon") return;
    function onScroll() {
      setShowScrollTop(window.scrollY > 600);
      // Calcular progresso de scroll
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.round((window.scrollY / docHeight) * 100)));
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [readingMode]);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  // ─── Top Bar ───────────────────────────────────────────

  const TopBar = (
    <Flex
      align="center"
      justify="between"
      py="2"
      px="3"
      style={{
        borderBottom: "1px solid var(--gray-a4)",
        background: "var(--color-background)",
        position: "sticky",
        top: 57,
        zIndex: 40,
      }}
    >
      <Flex align="center" gap="2">
        <Link href={`/manga/${mangaId}`}>
          <IconButton variant="ghost" size="1" color="gray">
            <ArrowLeft size={16} />
          </IconButton>
        </Link>
        <Text size="2" weight="medium" truncate style={{ maxWidth: 200 }}>
          {t("chapters.col_number")} {chapter.number}
          {chapter.title ? ` — ${chapter.title}` : ""}
        </Text>
      </Flex>

      <Flex align="center" gap="2">
        {/* Mode toggle inline */}
        <Tooltip content={`${readingMode === "default" ? t("reader.mode_webtoon") : t("reader.mode_page")} (M)`}>
          <IconButton
            variant="ghost"
            size="1"
            color="gray"
            onClick={toggleMode}
            aria-label={t("reader.mode")}
          >
            {readingMode === "default" ? <Rows3 size={16} /> : <Columns2 size={16} />}
          </IconButton>
        </Tooltip>

        <Select.Root
          value={chapter.id}
          onValueChange={(id) => router.push(`/manga/${mangaId}/chapter/${id}`)}
        >
          <Select.Trigger
            variant="ghost"
            placeholder={t("reader.go_to")}
            style={{ maxWidth: 140 }}
          />
          <Select.Content>
            {sorted.map((c) => (
              <Select.Item key={c.id} value={c.id}>
                {t("chapters.col_number")} {c.number}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <ReaderSettingsDialog
          readingMode={readingMode}
          setReadingMode={setReadingMode}
          autoNextChapter={autoNextChapter}
          setAutoNextChapter={setAutoNextChapter}
          showPageNumber={showPageNumber}
          setShowPageNumber={setShowPageNumber}
        />
      </Flex>
    </Flex>
  );

  // ─── Default Mode ─────────────────────────────────────

  const DefaultMode = (
    <Flex direction="column" align="center" gap="4" py="4" px="2">
      {totalPages === 0 ? (
        <Flex direction="column" align="center" gap="2" py="9">
          <BookOpen size={48} style={{ color: "var(--gray-8)" }} />
          <Text color="gray">{t("reader.no_pages")}</Text>
        </Flex>
      ) : (
        <>
          <Box
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 800,
              minHeight: 400,
              cursor: "pointer",
            }}
            onClick={goNextPage}
          >
            {imageErrors.has(currentPage) ? (
              <Flex
                align="center"
                justify="center"
                style={{
                  height: 400,
                  background: "var(--gray-a3)",
                  borderRadius: "var(--radius-2)",
                }}
              >
                <Text color="gray">{t("reader.image_error")}</Text>
              </Flex>
            ) : (
              <Image
                key={currentPage}
                src={images[currentPage]}
                alt={`${t("reader.mode_page")} ${currentPage + 1}`}
                width={800}
                height={1200}
                style={{ width: "100%", height: "auto", borderRadius: "var(--radius-2)" }}
                priority
                unoptimized
                onError={() => handleImageError(currentPage)}
              />
            )}
          </Box>

          <Flex align="center" gap="3">
            <IconButton variant="soft" size="3" disabled={currentPage === 0} onClick={goPrevPage}>
              <ChevronLeft size={20} />
            </IconButton>
            {showPageNumber && (
              <Text size="2" color="gray" style={{ minWidth: 80, textAlign: "center" }}>
                {currentPage + 1} / {totalPages}
              </Text>
            )}
            <IconButton
              variant="soft"
              size="3"
              disabled={currentPage >= totalPages - 1 && !nextChapter}
              onClick={goNextPage}
            >
              <ChevronRight size={20} />
            </IconButton>
          </Flex>
        </>
      )}
    </Flex>
  );

  // ─── Webtoon Mode ─────────────────────────────────────

  const WebtoonMode = (
    <>
      {/* Barra de progresso fixa no topo */}
      {totalPages > 0 && (
        <Box
          style={{
            position: "fixed",
            top: 57 + 41, // header + topbar
            left: 0,
            right: 0,
            height: 3,
            zIndex: 39,
            background: "var(--gray-a3)",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${scrollProgress}%`,
              background: "var(--accent-9)",
              transition: "width 0.1s ease-out",
            }}
          />
        </Box>
      )}

      <Flex ref={webtoonRef} direction="column" align="center" gap="0" py="2" px="2">
        {totalPages === 0 ? (
          <Flex direction="column" align="center" gap="2" py="9">
            <BookOpen size={48} style={{ color: "var(--gray-8)" }} />
            <Text color="gray">{t("reader.no_pages")}</Text>
          </Flex>
        ) : (
          images.map((url, i) => (
            <Box key={i} style={{ width: "100%", maxWidth: 800 }}>
              {imageErrors.has(i) ? (
                <Flex
                  align="center"
                  justify="center"
                  style={{ height: 200, background: "var(--gray-a3)" }}
                >
                  <Text size="1" color="gray">
                    {t("reader.image_error")} {i + 1}
                  </Text>
                </Flex>
              ) : (
                <Image
                  src={url}
                  alt={`${t("reader.mode_page")} ${i + 1}`}
                  width={800}
                  height={1200}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  loading={i < 3 ? "eager" : "lazy"}
                  unoptimized
                  onError={() => handleImageError(i)}
                />
              )}
            </Box>
          ))
        )}
      </Flex>

      {/* Floating controls */}
      {showScrollTop && (
        <Flex
          direction="column"
          gap="2"
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 30,
            alignItems: "center",
          }}
        >
          <Badge
            variant="solid"
            size="1"
            style={{
              background: "var(--gray-a10)",
              backdropFilter: "blur(8px)",
            }}
          >
            {scrollProgress}%
          </Badge>
          <IconButton
            variant="solid"
            size="3"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp size={18} />
          </IconButton>
        </Flex>
      )}
    </>
  );

  // ─── Bottom Bar ────────────────────────────────────────

  const BottomBar = (
    <Flex
      align="center"
      justify="between"
      py="3"
      px="4"
      style={{
        borderTop: "1px solid var(--gray-a4)",
        background: "var(--color-background)",
      }}
    >
      <Button variant="soft" color="gray" disabled={!prevChapter} onClick={goPrevChapter}>
        <ChevronLeft size={16} />
        {t("reader.prev")}
      </Button>
      <Text size="2" color="gray">
        {t("chapters.col_number")} {chapter.number}
      </Text>
      <Button variant="soft" disabled={!nextChapter} onClick={goNextChapter}>
        {t("reader.next")}
        <ChevronRight size={16} />
      </Button>
    </Flex>
  );

  return (
    <Flex direction="column" style={{ minHeight: "100%" }}>
      {TopBar}
      <Box style={{ flex: 1 }}>
        {readingMode === "default" ? DefaultMode : WebtoonMode}
      </Box>
      {BottomBar}
    </Flex>
  );
}

// ─── Settings Dialog ──────────────────────────────────────

function ReaderSettingsDialog({
  readingMode,
  setReadingMode,
  autoNextChapter,
  setAutoNextChapter,
  showPageNumber,
  setShowPageNumber,
}: {
  readingMode: "default" | "webtoon";
  setReadingMode: (m: "default" | "webtoon") => void;
  autoNextChapter: boolean;
  setAutoNextChapter: (v: boolean) => void;
  showPageNumber: boolean;
  setShowPageNumber: (v: boolean) => void;
}) {
  const { t } = useLocale();

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton variant="ghost" size="1" color="gray">
          <Settings size={16} />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="400px">
        <Dialog.Title>{t("reader.settings")}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {t("reader.settings_desc")}
        </Dialog.Description>

        <Flex direction="column" gap="4">
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {t("reader.mode")}
            </Text>
            <SegmentedControl.Root
              value={readingMode}
              onValueChange={(v) => setReadingMode(v as "default" | "webtoon")}
            >
              <SegmentedControl.Item value="default">
                <Flex align="center" gap="1">
                  <Columns2 size={14} />
                  {t("reader.mode_page")}
                </Flex>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="webtoon">
                <Flex align="center" gap="1">
                  <Rows3 size={14} />
                  {t("reader.mode_webtoon")}
                </Flex>
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>

          <Separator size="4" />

          <Flex align="center" justify="between">
            <Flex direction="column">
              <Text size="2" weight="medium">{t("reader.auto_next")}</Text>
              <Text size="1" color="gray">{t("reader.auto_next_desc")}</Text>
            </Flex>
            <Switch checked={autoNextChapter} onCheckedChange={setAutoNextChapter} />
          </Flex>

          <Flex align="center" justify="between">
            <Flex direction="column">
              <Text size="2" weight="medium">{t("reader.show_page_number")}</Text>
              <Text size="1" color="gray">{t("reader.show_page_number_desc")}</Text>
            </Flex>
            <Switch checked={showPageNumber} onCheckedChange={setShowPageNumber} />
          </Flex>

          <Separator size="4" />

          <Flex direction="column" gap="2">
            <Flex align="center" gap="1">
              <Keyboard size={14} />
              <Text size="2" weight="medium">{t("reader.shortcuts")}</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <ShortcutRow keys="← →" desc={t("reader.shortcut_page")} />
              <ShortcutRow keys="Ctrl+← Ctrl+→" desc={t("reader.shortcut_chapter")} />
              <ShortcutRow keys="Home / End" desc={t("reader.shortcut_home_end")} />
              <ShortcutRow keys="M" desc={t("reader.shortcut_mode")} />
              <ShortcutRow keys="Esc" desc={t("reader.shortcut_back")} />
            </Flex>
          </Flex>
        </Flex>

        <Flex justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              {t("general.close")}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <Flex align="center" justify="between" gap="2">
      <Text size="1" color="gray">{desc}</Text>
      <Flex gap="1">
        {keys.split(" ").map((k) => (
          <Badge key={k} variant="surface" size="1" color="gray">{k}</Badge>
        ))}
      </Flex>
    </Flex>
  );
}
