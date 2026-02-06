"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Section,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Card,
  Button,
  TextField,
  Callout,
  Badge,
  Separator,
  DataList,
  Spinner,
  Box,
  ScrollArea,
} from "@radix-ui/themes";
import {
  Settings,
  Database,
  Download,
  Search,
  Image as ImageIcon,
  BookOpen,
  Users,
  Layers,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  RefreshCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePopulationStats,
  useHealthCheck,
  usePopulatePopular,
  usePopulateRecent,
  usePopulateComplete,
  useUpdateCovers,
} from "@/hooks/queries";
import { useLocale } from "@/hooks/useLocale";
import {
  adminService,
  mangadexService,
  type MangaDexSearchResult,
} from "@/services/api";

export default function AdminPage() {
  const { t } = useLocale();

  return (
    <Section size="2">
      <Container size="4" px="4">
        <Flex direction="column" gap="6">
          <Flex align="center" gap="2">
            <Settings size={24} style={{ color: "var(--accent-9)" }} />
            <Heading size="6">{t("admin.title")}</Heading>
          </Flex>

          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <StatsCard />
            <HealthCard />
          </Grid>

          <Separator size="4" />

          <Heading size="4">{t("admin.actions_title")}</Heading>

          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <PopulatePopularCard />
            <PopulateRecentCard />
            <PopulateCompleteCard />
            <UpdateCoversCard />
          </Grid>

          <Separator size="4" />

          <SearchAndSaveCard />
        </Flex>
      </Container>
    </Section>
  );
}

// ─── Stats ───────────────────────────────────────────────

function StatsCard() {
  const { data, isLoading, isError, refetch } = usePopulationStats();
  const { t } = useLocale();

  return (
    <Card size="3">
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Database size={18} style={{ color: "var(--accent-9)" }} />
            <Text size="3" weight="bold">{t("admin.stats_title")}</Text>
          </Flex>
          <Button variant="ghost" size="1" color="gray" onClick={() => refetch()}>
            <RefreshCw size={14} />
          </Button>
        </Flex>

        {isLoading && <Spinner size="2" />}
        {isError && <Text size="2" color="red">{t("admin.stats_error")}</Text>}

        {data && (
          <DataList.Root size="2">
            <DataList.Item>
              <DataList.Label>
                <Flex align="center" gap="1"><BookOpen size={14} />{t("admin.stats_mangas")}</Flex>
              </DataList.Label>
              <DataList.Value>
                <Badge variant="soft" color="iris" size="2">{data.totalMangas}</Badge>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>
                <Flex align="center" gap="1"><Users size={14} />{t("admin.stats_authors")}</Flex>
              </DataList.Label>
              <DataList.Value>
                <Badge variant="soft" color="cyan" size="2">{data.totalAuthors}</Badge>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>
                <Flex align="center" gap="1"><Layers size={14} />{t("admin.stats_chapters")}</Flex>
              </DataList.Label>
              <DataList.Value>
                <Badge variant="soft" color="green" size="2">{data.totalChapters}</Badge>
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>
        )}
      </Flex>
    </Card>
  );
}

// ─── Health ──────────────────────────────────────────────

function HealthCard() {
  const { data, isLoading, isError, refetch } = useHealthCheck();
  const { t } = useLocale();

  return (
    <Card size="3">
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Activity size={18} style={{ color: "var(--green-9)" }} />
            <Text size="3" weight="bold">{t("admin.health_title")}</Text>
          </Flex>
          <Button variant="ghost" size="1" color="gray" onClick={() => refetch()}>
            <RefreshCw size={14} />
          </Button>
        </Flex>

        {isLoading && <Spinner size="2" />}

        {isError && (
          <Callout.Root color="red" size="1">
            <Callout.Icon><AlertCircle size={14} /></Callout.Icon>
            <Callout.Text>{t("admin.health_down")}</Callout.Text>
          </Callout.Root>
        )}

        {data && (
          <Callout.Root color={data.status === "UP" ? "green" : "orange"} size="1">
            <Callout.Icon><CheckCircle size={14} /></Callout.Icon>
            <Callout.Text>{data.message || t("admin.health_up")}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </Card>
  );
}

// ─── Generic Action Card ─────────────────────────────────

function ActionCard({
  icon: Icon,
  titleKey,
  descKey,
  buttonKey,
  onAction,
  isPending,
  result,
  color = "iris",
}: {
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  titleKey: string;
  descKey: string;
  buttonKey: string;
  onAction: () => void;
  isPending: boolean;
  result?: { status?: string; message?: string } | null;
  color?: "iris" | "cyan" | "green" | "orange";
}) {
  const { t } = useLocale();

  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2">
          <Icon size={18} style={{ color: `var(--${color}-9)` }} />
          <Text size="2" weight="bold">{t(titleKey)}</Text>
        </Flex>
        <Text size="1" color="gray">{t(descKey)}</Text>

        <Button variant="soft" color={color} onClick={onAction} disabled={isPending}>
          {isPending ? <Spinner size="1" /> : <Icon size={14} style={{}} />}
          {isPending ? t("admin.processing") : t(buttonKey)}
        </Button>

        {result && (
          <Callout.Root color={result.status === "success" ? "green" : "red"} size="1">
            <Callout.Icon>
              {result.status === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            </Callout.Icon>
            <Callout.Text>{result.message}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </Card>
  );
}

function PopulatePopularCard() {
  const m = usePopulatePopular();
  return (
    <ActionCard
      icon={Download}
      titleKey="admin.popular_title"
      descKey="admin.popular_desc"
      buttonKey="admin.popular_btn"
      onAction={() => m.mutate({ limit: 20, offset: 0 })}
      isPending={m.isPending}
      result={m.data}
      color="iris"
    />
  );
}

function PopulateRecentCard() {
  const m = usePopulateRecent();
  return (
    <ActionCard
      icon={Zap}
      titleKey="admin.recent_title"
      descKey="admin.recent_desc"
      buttonKey="admin.recent_btn"
      onAction={() => m.mutate({ limit: 20, offset: 0 })}
      isPending={m.isPending}
      result={m.data}
      color="cyan"
    />
  );
}

function PopulateCompleteCard() {
  const m = usePopulateComplete();
  return (
    <ActionCard
      icon={Database}
      titleKey="admin.complete_title"
      descKey="admin.complete_desc"
      buttonKey="admin.complete_btn"
      onAction={() => m.mutate({ mangaLimit: 10, offset: 0, includeChapters: true })}
      isPending={m.isPending}
      result={m.data}
      color="green"
    />
  );
}

function UpdateCoversCard() {
  const m = useUpdateCovers();
  return (
    <ActionCard
      icon={ImageIcon}
      titleKey="admin.covers_title"
      descKey="admin.covers_desc"
      buttonKey="admin.covers_btn"
      onAction={() => m.mutate()}
      isPending={m.isPending}
      result={
        m.data
          ? { status: "success", message: String(m.data) }
          : m.error
          ? { status: "error", message: m.error.message }
          : null
      }
      color="orange"
    />
  );
}

// ─── Search and Import ────────────────────────────────────

const DEBOUNCE_MS = 400;

function SearchAndSaveCard() {
  const [searchTitle, setSearchTitle] = useState("");
  const [results, setResults] = useState<MangaDexSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const { t } = useLocale();
  const abortRef = useRef<AbortController | null>(null);

  const doSearch = useCallback(
    async (q: string) => {
      // Cancela requisição anterior
      abortRef.current?.abort();

      if (q.length < 2) {
        setResults([]);
        setSearchedQuery(null);
        setSearchError(null);
        setIsSearching(false);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setIsSearching(true);
      setSearchError(null);

      try {
        const data = await mangadexService.search(q, 15, controller.signal);
        if (!controller.signal.aborted) {
          setResults(data);
          setSearchedQuery(q);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setSearchError(
            err instanceof Error ? err.message : t("general.error")
          );
          setSearchedQuery(q);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    },
    [t]
  );

  // Debounce: dispara busca automaticamente após o usuário parar de digitar
  useEffect(() => {
    const q = searchTitle.trim();
    const timer = setTimeout(() => doSearch(q), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTitle, doSearch]);

  // Cleanup: cancela requisição ao desmontar
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <Search size={18} style={{ color: "var(--accent-9)" }} />
          <Text size="3" weight="bold">{t("admin.search_title")}</Text>
        </Flex>
        <Text size="2" color="gray">{t("admin.search_desc")}</Text>

        {/* Search input */}
        <TextField.Root
          placeholder={t("admin.search_placeholder")}
          size="2"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        >
          <TextField.Slot>
            <Search size={14} />
          </TextField.Slot>
          {isSearching && (
            <TextField.Slot>
              <Spinner size="1" />
            </TextField.Slot>
          )}
        </TextField.Root>

        {/* Error */}
        {searchError && (
          <Callout.Root color="red" size="1">
            <Callout.Icon><AlertCircle size={14} /></Callout.Icon>
            <Callout.Text>{searchError}</Callout.Text>
          </Callout.Root>
        )}

        {/* Empty result */}
        {!isSearching && searchedQuery && results.length === 0 && !searchError && (
          <Flex direction="column" align="center" gap="2" py="4">
            <Search size={32} style={{ color: "var(--gray-8)" }} />
            <Text size="2" color="gray">
              {t("admin.search_empty", { query: searchedQuery })}
            </Text>
          </Flex>
        )}

        {/* Hint when nothing typed */}
        {!isSearching && !searchedQuery && searchTitle.trim().length < 2 && (
          <Flex justify="center" py="4">
            <Text size="2" color="gray">{t("admin.search_hint")}</Text>
          </Flex>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Flex direction="column" gap="3">
            <Text size="2" color="gray">
              {t("admin.search_results", { count: results.length })}
            </Text>
            <ScrollArea style={{ maxHeight: 600 }}>
              <Flex direction="column" gap="2">
                {results.map((r) => (
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
        {/* Cover thumbnail */}
        <Box
          style={{
            width: 60,
            height: 90,
            borderRadius: "var(--radius-2)",
            overflow: "hidden",
            flexShrink: 0,
            background: "var(--gray-a3)",
          }}
        >
          {result.coverUrl ? (
            <img
              src={result.coverUrl}
              alt={result.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Flex align="center" justify="center" style={{ height: "100%" }}>
              <BookOpen size={20} style={{ color: "var(--gray-8)" }} />
            </Flex>
          )}
        </Box>

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
              <Badge size="1" variant="soft" color={
                result.status === "ongoing" ? "green" :
                result.status === "completed" ? "blue" :
                result.status === "hiatus" ? "orange" : "gray"
              }>
                {t(`status.${result.status}` as never) || result.status}
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
              <Button size="1" variant="soft" color="red" onClick={handleSave}>
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
