"use client";

import {
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  Section,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Button,
  Callout,
  Spinner,
} from "@radix-ui/themes";
import { Library, AlertCircle } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInfiniteMangas } from "@/hooks/queries";
import { MangaCard, MangaCardSkeleton } from "@/components/manga/MangaCard";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { getTitle } from "@/lib/utils";
import { useLocale } from "@/hooks/useLocale";
import type { Manga } from "@/types/manga";

const ITEMS_PER_PAGE = 20;
const ROW_HEIGHT = 420; // altura estimada de um card + gap
const GAP = 16;

/**
 * Calcula quantas colunas cabem com base na largura do container.
 * Corresponde ao breakpoint Radix: initial=2, sm=3, md=4, lg=5
 */
function useColumnCount() {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 520) setCols(2);
      else if (w < 768) setCols(3);
      else if (w < 1024) setCols(4);
      else setCols(5);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

export default function LibraryPage() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useLocale();
  const columnCount = useColumnCount();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMangas(status, ITEMS_PER_PAGE);

  const allMangas = useMemo(() => {
    const flat: Manga[] = data?.pages.flatMap((page) => page.content) ?? [];
    if (!search.trim()) return flat;
    const q = search.toLowerCase();
    return flat.filter((m) => getTitle(m, locale).toLowerCase().includes(q));
  }, [data, search, locale]);

  const totalElements = data?.pages[0]?.totalElements ?? 0;

  // Divide mangas em linhas de N colunas
  const rows = useMemo(() => {
    const result: Manga[][] = [];
    for (let i = 0; i < allMangas.length; i += columnCount) {
      result.push(allMangas.slice(i, i + columnCount));
    }
    return result;
  }, [allMangas, columnCount]);

  // ─── TanStack Virtual: virtualiza linhas do grid ────────
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
  });

  // Quando o usuário chega perto do final, carrega mais
  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastVirtualRow = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastVirtualRow) return;
    if (
      lastVirtualRow.index >= rows.length - 2 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [lastVirtualRow, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Section size="2">
      <Container size="4" px="4">
        <Flex direction="column" gap="5">
          <Flex align="center" gap="2">
            <Library size={24} style={{ color: "var(--accent-9)" }} />
            <Heading size="6">{t("library.title")}</Heading>
          </Flex>

          <LibraryFilters
            status={status}
            onStatusChange={setStatus}
            search={search}
            onSearchChange={setSearch}
            totalResults={totalElements}
          />

          {isError && (
            <Callout.Root color="red" size="2">
              <Callout.Icon>
                <AlertCircle size={16} />
              </Callout.Icon>
              <Callout.Text>
                {error?.message || t("general.error")}
              </Callout.Text>
            </Callout.Root>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <Grid
              columns={{ initial: "2", sm: "3", md: "4", lg: "5" }}
              gap="4"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <MangaCardSkeleton key={i} />
              ))}
            </Grid>
          )}

          {/* Virtualized grid */}
          {!isLoading && allMangas.length > 0 && (
            <div
              ref={scrollRef}
              style={{
                height: "calc(100vh - 280px)",
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
                {virtualItems.map((virtualRow) => {
                  const rowMangas = rows[virtualRow.index];
                  return (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        display: "grid",
                        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                        gap: GAP,
                      }}
                    >
                      {rowMangas.map((manga) => (
                        <MangaCard key={manga.id} manga={manga} />
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Loading indicator at bottom */}
              {isFetchingNextPage && (
                <Flex justify="center" py="4">
                  <Spinner size="3" />
                </Flex>
              )}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && allMangas.length === 0 && (
            <Flex direction="column" align="center" gap="2" py="9">
              <Library size={48} style={{ color: "var(--gray-8)" }} />
              <Text size="3" color="gray">
                {t("library.empty")}
              </Text>
              <Text size="2" color="gray">
                {t("library.empty_hint")}
              </Text>
            </Flex>
          )}

          {hasNextPage && !isFetchingNextPage && !isLoading && allMangas.length > 0 && (
            <Flex justify="center">
              <Button variant="soft" onClick={() => fetchNextPage()}>
                {t("library.load_more")}
              </Button>
            </Flex>
          )}
        </Flex>
      </Container>
    </Section>
  );
}
