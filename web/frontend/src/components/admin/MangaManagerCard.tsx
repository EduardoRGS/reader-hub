"use client";

import { useState, useMemo, useEffect } from "react";
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
  Dialog,
  Checkbox,
  Separator,
} from "@radix-ui/themes";
import {
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Database,
} from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { useDeleteMangasBatch } from "@/hooks/queries";
import { useMangas } from "@/hooks/queries";
import { MiniCover } from "@/components/shared/MiniCover";
import type { Manga } from "@/types/manga";

// ─── Constants ────────────────────────────────────────────
const PAGE_SIZE = 20;

// ─── Helper: extrair título preferido ─────────────────────
function getMangaTitle(manga: Manga, fallback: string): string {
  return (
    manga.title?.["pt-br"] ||
    manga.title?.en ||
    Object.values(manga.title || {})[0] ||
    fallback
  );
}

// ─── Manga Manager Card ──────────────────────────────────

export function MangaManagerCard() {
  const { t } = useLocale();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Carregar mangás paginados
  const offset = page * PAGE_SIZE;
  const { data, isLoading, isError, refetch } = useMangas(
    PAGE_SIZE,
    offset
  );

  const deleteBatch = useDeleteMangasBatch();

  // Total e lista de mangás
  const totalMangas = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const content = data?.content;

  // Resetar paginação quando o filtro muda
  useEffect(() => {
    setPage(0);
  }, [filter]);

  // Filtrar localmente por título
  const filteredMangas = useMemo(() => {
    const mangas = content ?? [];
    if (!filter.trim()) return mangas;
    const q = filter.toLowerCase();
    return mangas.filter((m) =>
      getMangaTitle(m, "").toLowerCase().includes(q)
    );
  }, [content, filter]);

  // Handlers de seleção
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredMangas.forEach((m) => next.add(m.id));
      return next;
    });
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const allVisibleSelected =
    filteredMangas.length > 0 &&
    filteredMangas.every((m) => selectedIds.has(m.id));

  // Handler de exclusão em lote
  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setSuccessMsg(null);
    try {
      const result = await deleteBatch.mutateAsync(ids);
      setSuccessMsg(t("admin.manage_deleted", { count: result.deleted }));
      setSelectedIds(new Set());
      setConfirmOpen(false);
      refetch();
    } catch {
      setConfirmOpen(false);
    }
  };

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        {/* Header */}
        <Flex align="center" gap="2">
          <Database size={18} style={{ color: "var(--red-9)" }} />
          <Text size="3" weight="bold">
            {t("admin.manage_title")}
          </Text>
          {totalMangas > 0 && (
            <Badge variant="soft" color="gray" size="1">
              {t("admin.manage_total", { count: totalMangas })}
            </Badge>
          )}
        </Flex>
        <Text size="2" color="gray">
          {t("admin.manage_desc")}
        </Text>

        {/* Filter + actions bar */}
        <Flex gap="3" align="end" wrap="wrap">
          <Box style={{ flex: 1, minWidth: 200 }}>
            <TextField.Root
              placeholder={t("admin.manage_search_placeholder")}
              size="2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <TextField.Slot>
                <Search size={14} />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          {filteredMangas.length > 0 && (
            <Button
              size="1"
              variant="soft"
              color="gray"
              onClick={allVisibleSelected ? deselectAll : selectAllVisible}
            >
              {allVisibleSelected
                ? t("admin.manage_deselect_all")
                : t("admin.manage_select_all")}
            </Button>
          )}

          {selectedIds.size > 0 && (
            <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
              <Dialog.Trigger>
                <Button size="1" color="red">
                  <Trash2 size={12} />
                  {t("admin.manage_delete_selected")} ({selectedIds.size})
                </Button>
              </Dialog.Trigger>

              <Dialog.Content maxWidth="450px">
                <Flex direction="column" gap="4">
                  <Flex align="center" gap="2">
                    <AlertTriangle
                      size={20}
                      style={{ color: "var(--red-9)" }}
                    />
                    <Dialog.Title size="4">
                      {t("admin.manage_confirm_title")}
                    </Dialog.Title>
                  </Flex>

                  <Dialog.Description size="2" color="gray">
                    {t("admin.manage_confirm_desc", {
                      count: selectedIds.size,
                    })}
                  </Dialog.Description>

                  <Flex gap="3" justify="end">
                    <Dialog.Close>
                      <Button variant="soft" color="gray">
                        {t("admin.manage_confirm_no")}
                      </Button>
                    </Dialog.Close>
                    <Button
                      color="red"
                      onClick={handleBatchDelete}
                      disabled={deleteBatch.isPending}
                    >
                      {deleteBatch.isPending ? (
                        <Spinner size="1" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      {t("admin.manage_confirm_yes", {
                        count: selectedIds.size,
                      })}
                    </Button>
                  </Flex>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
          )}
        </Flex>

        {/* Selection counter */}
        {selectedIds.size > 0 && (
          <Flex align="center" gap="2">
            <Badge variant="solid" color="red" size="2">
              {t("admin.manage_selected", { count: selectedIds.size })}
            </Badge>
            <Button
              size="1"
              variant="ghost"
              color="gray"
              onClick={deselectAll}
            >
              {t("admin.manage_deselect_all")}
            </Button>
          </Flex>
        )}

        {/* Success message */}
        {successMsg && (
          <Callout.Root color="green" size="1">
            <Callout.Icon>
              <CheckCircle size={14} />
            </Callout.Icon>
            <Callout.Text>{successMsg}</Callout.Text>
          </Callout.Root>
        )}

        {/* Error message */}
        {deleteBatch.isError && (
          <Callout.Root color="red" size="1">
            <Callout.Icon>
              <AlertCircle size={14} />
            </Callout.Icon>
            <Callout.Text>
              {deleteBatch.error instanceof Error
                ? deleteBatch.error.message
                : t("admin.manage_delete_error")}
            </Callout.Text>
          </Callout.Root>
        )}

        {isError && (
          <Callout.Root color="red" size="1">
            <Callout.Icon>
              <AlertCircle size={14} />
            </Callout.Icon>
            <Callout.Text>{t("admin.stats_error")}</Callout.Text>
          </Callout.Root>
        )}

        {/* Loading state */}
        {isLoading && (
          <Flex justify="center" py="6">
            <Flex align="center" gap="2">
              <Spinner size="2" />
              <Text size="2" color="gray">
                {t("admin.manage_loading")}
              </Text>
            </Flex>
          </Flex>
        )}

        {/* Empty state */}
        {!isLoading && totalMangas === 0 && (
          <Flex direction="column" align="center" gap="2" py="6">
            <Database size={32} style={{ color: "var(--gray-8)" }} />
            <Text size="2" color="gray">
              {t("admin.manage_empty")}
            </Text>
          </Flex>
        )}

        {/* Manga list */}
        {filteredMangas.length > 0 && (
          <ScrollArea style={{ maxHeight: 520 }}>
            <Flex direction="column" gap="2">
              {filteredMangas.map((manga) => (
                <MangaRow
                  key={manga.id}
                  manga={manga}
                  selected={selectedIds.has(manga.id)}
                  onToggle={() => toggleSelect(manga.id)}
                />
              ))}
            </Flex>
          </ScrollArea>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Separator size="4" />
            <Flex align="center" justify="between">
              <Text size="1" color="gray">
                {t("library.page_info", {
                  current: page + 1,
                  total: totalPages,
                })}
              </Text>
              <Flex gap="2">
                <Button
                  size="1"
                  variant="soft"
                  color="gray"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  {t("pagination.prev")}
                </Button>
                <Button
                  size="1"
                  variant="soft"
                  color="gray"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("pagination.next")}
                </Button>
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </Card>
  );
}

// ─── Single manga row with checkbox ──────────────────────

function MangaRow({
  manga,
  selected,
  onToggle,
}: {
  manga: Manga;
  selected: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const title = getMangaTitle(manga, t("manga.no_title"));

  return (
    <Card
      size="1"
      variant="surface"
      style={{
        cursor: "pointer",
        outline: selected ? "2px solid var(--red-8)" : "none",
        outlineOffset: -1,
        transition: "outline 0.15s ease",
      }}
      onClick={onToggle}
    >
      <Flex gap="3" align="center">
        {/* Checkbox */}
        <Box
          onClick={(e) => e.stopPropagation()}
          style={{ flexShrink: 0 }}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggle()}
            color="red"
          />
        </Box>

        {/* Cover thumbnail */}
        <MiniCover
          src={manga.coverImage}
          alt={title}
          width={40}
          height={56}
          iconSize={16}
        />

        {/* Info */}
        <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <Text size="2" weight="bold" truncate>
            {title}
          </Text>

          <Flex align="center" gap="2" wrap="wrap">
            {manga.status && (
              <Badge
                size="1"
                variant="soft"
                color={
                  manga.status === "ongoing"
                    ? "green"
                    : manga.status === "completed"
                    ? "blue"
                    : manga.status === "hiatus"
                    ? "orange"
                    : "gray"
                }
              >
                {t(`status.${manga.status}`) || manga.status}
              </Badge>
            )}
            {manga.year && (
              <Badge size="1" variant="outline" color="gray">
                {manga.year}
              </Badge>
            )}
            {manga.totalChapters !== undefined && manga.totalChapters > 0 && (
              <Badge size="1" variant="outline" color="gray">
                {t("admin.manage_chapters_count", {
                  count: manga.totalChapters,
                })}
              </Badge>
            )}
            {manga.rating !== undefined && manga.rating > 0 && (
              <Badge size="1" variant="soft" color="amber">
                ★ {manga.rating.toFixed(1)}
              </Badge>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
