"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Section,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Callout,
  Spinner,
  Box,
} from "@radix-ui/themes";
import { Library, AlertCircle } from "lucide-react";
import { useLibraryMangas } from "@/hooks/queries";
import { MangaCard, MangaCardSkeleton } from "@/components/manga/MangaCard";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { Pagination } from "@/components/library/Pagination";
import { useLocale } from "@/hooks/useLocale";

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 400;

// Wrapper com Suspense para useSearchParams (exigido pelo Next.js 15)
export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" align="center" py="9">
          <Spinner size="3" />
        </Flex>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const { t } = useLocale();
  const topRef = useRef<HTMLDivElement>(null);

  // Sincronizar quando o param ?q muda (ex: busca do header)
  const qParam = searchParams.get("q") ?? "";
  useEffect(() => {
    if (qParam) {
      setSearchInput(qParam);
      setDebouncedSearch(qParam);
      setPage(0);
    }
  }, [qParam]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset de página quando muda status
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top da lista
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const { data, isLoading, isError, error, isFetching } = useLibraryMangas(
    page,
    ITEMS_PER_PAGE,
    status,
    debouncedSearch
  );

  const mangas = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <Section size="2">
      <Container size="4" px="4">
        <Flex direction="column" gap="5">
          {/* Header */}
          <div ref={topRef}>
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "var(--accent-a3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Library size={20} style={{ color: "var(--accent-9)" }} />
              </Box>
              <Flex direction="column">
                <Heading size="6">{t("library.title")}</Heading>
                {totalElements > 0 && (
                  <Text size="2" color="gray">
                    {t("library.results", { count: totalElements })}
                  </Text>
                )}
              </Flex>

              {/* Loading indicator when refetching */}
              {isFetching && !isLoading && (
                <Spinner size="2" style={{ marginLeft: "auto" }} />
              )}
            </Flex>
          </div>

          {/* Filters */}
          <LibraryFilters
            status={status}
            onStatusChange={handleStatusChange}
            search={searchInput}
            onSearchChange={setSearchInput}
          />

          {/* Error */}
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
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <MangaCardSkeleton key={i} />
              ))}
            </Grid>
          )}

          {/* Manga grid */}
          {!isLoading && mangas.length > 0 && (
            <Grid
              columns={{ initial: "2", sm: "3", md: "4", lg: "5" }}
              gap="4"
              className="stagger-children"
            >
              {mangas.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </Grid>
          )}

          {/* Empty state */}
          {!isLoading && mangas.length === 0 && (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex direction="column" align="center" gap="2">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={2}
              />
              <Text size="1" color="gray">
                {t("library.page_info", {
                  current: page + 1,
                  total: totalPages,
                })}
              </Text>
            </Flex>
          )}
        </Flex>
      </Container>
    </Section>
  );
}
