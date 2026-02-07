"use client";

import { useState, useCallback } from "react";
import {
  Flex,
  Text,
  Card,
  Badge,
  Button,
  TextField,
  Callout,
  ScrollArea,
  Spinner,
  Box,
} from "@radix-ui/themes";
import {
  Search,
  Download,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "@/hooks/useLocale";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import {
  adminService,
  mangadexService,
  type MangaDexSearchResult,
} from "@/services/api";
import { MiniCover } from "@/components/shared/MiniCover";

// ─── Search and Import Card ──────────────────────────────

export function SearchAndSaveCard() {
  const { t } = useLocale();

  const search = useDebouncedSearch<MangaDexSearchResult>(
    useCallback(async (q: string, signal: AbortSignal) => {
      return mangadexService.search(q, 15, signal);
    }, []),
    { debounceMs: 400 }
  );

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <Search size={18} style={{ color: "var(--accent-9)" }} />
          <Text size="3" weight="bold">
            {t("admin.search_title")}
          </Text>
        </Flex>
        <Text size="2" color="gray">
          {t("admin.search_desc")}
        </Text>

        {/* Search input */}
        <TextField.Root
          placeholder={t("admin.search_placeholder")}
          size="2"
          value={search.searchValue}
          onChange={(e) => search.setSearchValue(e.target.value)}
        >
          <TextField.Slot>
            <Search size={14} />
          </TextField.Slot>
          {search.isSearching && (
            <TextField.Slot>
              <Spinner size="1" />
            </TextField.Slot>
          )}
        </TextField.Root>

        {/* Error */}
        {search.error && (
          <Callout.Root color="red" size="1">
            <Callout.Icon>
              <AlertCircle size={14} />
            </Callout.Icon>
            <Callout.Text>{search.error}</Callout.Text>
          </Callout.Root>
        )}

        {/* Empty result */}
        {!search.isSearching &&
          search.hasSearched &&
          search.results.length === 0 &&
          !search.error && (
            <Flex direction="column" align="center" gap="2" py="4">
              <Search size={32} style={{ color: "var(--gray-8)" }} />
              <Text size="2" color="gray">
                {t("admin.search_empty", {
                  query: search.searchValue.trim(),
                })}
              </Text>
            </Flex>
          )}

        {/* Hint when nothing typed */}
        {!search.isSearching &&
          !search.hasSearched &&
          search.searchValue.trim().length < 2 && (
            <Flex justify="center" py="4">
              <Text size="2" color="gray">
                {t("admin.search_hint")}
              </Text>
            </Flex>
          )}

        {/* Results */}
        {search.results.length > 0 && (
          <Flex direction="column" gap="3">
            <Text size="2" color="gray">
              {t("admin.search_results", { count: search.results.length })}
            </Text>
            <ScrollArea style={{ maxHeight: 600 }}>
              <Flex direction="column" gap="2">
                {search.results.map((r) => (
                  <SearchResultItem key={r.id} result={r} />
                ))}
              </Flex>
            </ScrollArea>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

// ─── Single search result row ────────────────────────────

function SearchResultItem({ result }: { result: MangaDexSearchResult }) {
  const { t } = useLocale();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await adminService.saveMangaFromExternal(result.raw);
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["mangas"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("admin.search_save_error")
      );
    } finally {
      setSaving(false);
    }
  };

  const hasLangPt = result.availableLanguages?.some((l) =>
    l.startsWith("pt")
  );
  const hasLangEn = result.availableLanguages?.includes("en");

  return (
    <Card size="1" variant="surface">
      <Flex gap="3" align="start">
        {/* Cover thumbnail - usando next/image em vez de <img> */}
        <MiniCover
          src={result.coverUrl}
          alt={result.title}
          width={60}
          height={90}
          iconSize={20}
        />

        {/* Info */}
        <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <Text size="2" weight="bold" truncate>
            {result.title}
          </Text>

          {result.titleOriginal && (
            <Text size="1" color="gray" truncate>
              {t("admin.search_original")}: {result.titleOriginal}
            </Text>
          )}

          {result.description && (
            <Text
              size="1"
              color="gray"
              style={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {result.description}
            </Text>
          )}

          <Flex align="center" gap="2" mt="1" wrap="wrap">
            {result.status && (
              <Badge
                size="1"
                variant="soft"
                color={
                  result.status === "ongoing"
                    ? "green"
                    : result.status === "completed"
                    ? "blue"
                    : result.status === "hiatus"
                    ? "orange"
                    : "gray"
                }
              >
                {t(`status.${result.status}`) || result.status}
              </Badge>
            )}
            {result.year && (
              <Badge size="1" variant="outline" color="gray">
                {result.year}
              </Badge>
            )}
            <Badge size="1" variant="outline" color="gray">
              {result.lastChapter
                ? t("admin.search_chapters", { count: result.lastChapter })
                : t("admin.search_no_chapters")}
            </Badge>
            {hasLangPt && (
              <Badge size="1" variant="soft" color="green">
                PT
              </Badge>
            )}
            {hasLangEn && (
              <Badge size="1" variant="soft" color="blue">
                EN
              </Badge>
            )}
          </Flex>
        </Flex>

        {/* Save button */}
        <Box style={{ flexShrink: 0 }}>
          {saved ? (
            <Button size="1" variant="soft" color="green" disabled>
              <CheckCircle size={12} />
              {t("admin.search_saved")}
            </Button>
          ) : error ? (
            <Flex direction="column" align="end" gap="1">
              <Button
                size="1"
                variant="soft"
                color="red"
                onClick={handleSave}
              >
                {t("admin.search_save")}
              </Button>
              <Text size="1" color="red" style={{ maxWidth: 100 }} truncate>
                {error}
              </Text>
            </Flex>
          ) : (
            <Button
              size="1"
              variant="soft"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Spinner size="1" /> : <Download size={12} />}
              {saving ? t("admin.search_saving") : t("admin.search_save")}
            </Button>
          )}
        </Box>
      </Flex>
    </Card>
  );
}
