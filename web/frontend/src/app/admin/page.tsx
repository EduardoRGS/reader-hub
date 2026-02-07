"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  IconButton,
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
  SlidersHorizontal,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Shield,
  LogIn,
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
  mangaService,
  mangadexService,
  type MangaDexSearchResult,
} from "@/services/api";
import { useReaderStore, type SliderManga } from "@/store/readerStore";
import { useAuthStore } from "@/store/authStore";
import { getTitle } from "@/lib/utils";
import type { Manga } from "@/types/manga";

export default function AdminPage() {
  const { t } = useLocale();
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");
  const isAuthenticated = useAuthStore((s) => s.user !== null && s.accessToken !== null);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <Section size="3">
        <Container size="4" px="4">
          <Flex justify="center" align="center" py="9">
            <Spinner size="3" />
          </Flex>
        </Container>
      </Section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Section size="3">
        <Container size="1" px="4">
          <Card size="4">
            <Flex direction="column" align="center" gap="4" py="4">
              <LogIn size={48} style={{ color: "var(--accent-9)" }} />
              <Heading size="4" align="center">{t("auth.login_required")}</Heading>
              <Text size="2" color="gray" align="center">
                {t("auth.login_required_desc")}
              </Text>
              <Button size="3" onClick={() => router.push("/login")}>
                <LogIn size={16} />
                {t("auth.login")}
              </Button>
            </Flex>
          </Card>
        </Container>
      </Section>
    );
  }

  if (!isAdmin) {
    return (
      <Section size="3">
        <Container size="1" px="4">
          <Card size="4">
            <Flex direction="column" align="center" gap="4" py="4">
              <Shield size={48} style={{ color: "var(--red-9)" }} />
              <Heading size="4" align="center" color="red">
                {t("auth.access_denied")}
              </Heading>
              <Text size="2" color="gray" align="center">
                {t("auth.access_denied_desc")}
              </Text>
              <Button variant="soft" size="3" onClick={() => router.push("/")}>
                {t("nav.home")}
              </Button>
            </Flex>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section size="2">
      <Container size="4" px="4">
        <Flex direction="column" gap="6">
          <Flex align="center" gap="2">
            <Settings size={24} style={{ color: "var(--accent-9)" }} />
            <Heading size="6">{t("admin.title")}</Heading>
            <Badge variant="soft" color="amber" size="2">
              <Shield size={12} />
              {t("auth.admin_badge")}
            </Badge>
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

          <SliderManagerCard />

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

// ─── Slider Manager ──────────────────────────────────────

function SliderManagerCard() {
  const { locale, t } = useLocale();
  const sliderMangas = useReaderStore((s) => s.sliderMangas);
  const addSliderManga = useReaderStore((s) => s.addSliderManga);
  const removeSliderManga = useReaderStore((s) => s.removeSliderManga);
  const reorderSliderMangas = useReaderStore((s) => s.reorderSliderMangas);

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Live search nos mangás locais
  useEffect(() => {
    const q = searchValue.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const data = await mangaService.searchMangas(
          q,
          8,
          0,
          undefined,
          controller.signal
        );
        if (!controller.signal.aborted) {
          setSearchResults(data.content);
          setIsSearching(false);
        }
      } catch {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleAdd = (manga: Manga) => {
    const item: SliderManga = {
      id: manga.id,
      title: manga.title,
      description: manga.description as Record<string, string | undefined>,
      coverImage: manga.coverImage,
      author: manga.author?.name,
      rating: manga.rating,
      status: manga.status,
    };
    addSliderManga(item);
    setSearchValue("");
    setSearchResults([]);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const arr = [...sliderMangas];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorderSliderMangas(arr);
  };

  const moveDown = (index: number) => {
    if (index >= sliderMangas.length - 1) return;
    const arr = [...sliderMangas];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    reorderSliderMangas(arr);
  };

  const isInSlider = (id: string) => sliderMangas.some((m) => m.id === id);

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <SlidersHorizontal size={18} style={{ color: "var(--accent-9)" }} />
          <Text size="3" weight="bold">
            {t("admin.slider_title")}
          </Text>
          <Badge variant="soft" size="1">
            {sliderMangas.length}
          </Badge>
        </Flex>
        <Text size="2" color="gray">
          {t("admin.slider_desc")}
        </Text>

        {/* Current slider items */}
        {sliderMangas.length > 0 && (
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {t("admin.slider_current")}
            </Text>
            {sliderMangas.map((manga, index) => {
              const title =
                manga.title?.[locale === "pt-br" ? "pt-br" : "en"] ||
                manga.title?.["en"] ||
                Object.values(manga.title || {}).find(Boolean) ||
                "";
              return (
                <Card key={manga.id} size="1" variant="surface">
                  <Flex align="center" gap="3">
                    <GripVertical
                      size={16}
                      style={{ color: "var(--gray-8)", flexShrink: 0 }}
                    />

                    {/* Mini cover */}
                    <Box
                      style={{
                        width: 40,
                        height: 56,
                        borderRadius: "var(--radius-2)",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "var(--gray-a3)",
                        position: "relative",
                      }}
                    >
                      {manga.coverImage ? (
                        <Image
                          src={manga.coverImage}
                          alt={title}
                          fill
                          sizes="40px"
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                      ) : (
                        <Flex
                          align="center"
                          justify="center"
                          style={{ height: "100%" }}
                        >
                          <BookOpen
                            size={14}
                            style={{ color: "var(--gray-7)" }}
                          />
                        </Flex>
                      )}
                    </Box>

                    {/* Title and order */}
                    <Flex
                      direction="column"
                      gap="0"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <Text size="2" weight="medium" truncate>
                        {title}
                      </Text>
                      <Text size="1" color="gray">
                        {t("admin.slider_position", { pos: index + 1 })}
                      </Text>
                    </Flex>

                    {/* Reorder buttons */}
                    <Flex gap="1">
                      <IconButton
                        variant="ghost"
                        color="gray"
                        size="1"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp size={14} />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        color="gray"
                        size="1"
                        onClick={() => moveDown(index)}
                        disabled={index === sliderMangas.length - 1}
                      >
                        <ChevronDown size={14} />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        color="red"
                        size="1"
                        onClick={() => removeSliderManga(manga.id)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Flex>
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        )}

        {sliderMangas.length === 0 && (
          <Flex
            direction="column"
            align="center"
            gap="2"
            py="4"
            style={{
              border: "2px dashed var(--gray-a5)",
              borderRadius: "var(--radius-3)",
            }}
          >
            <SlidersHorizontal
              size={28}
              style={{ color: "var(--gray-8)" }}
            />
            <Text size="2" color="gray">
              {t("admin.slider_empty")}
            </Text>
          </Flex>
        )}

        {/* Search to add */}
        <Separator size="4" />
        <Text size="2" weight="medium">
          {t("admin.slider_add")}
        </Text>

        <TextField.Root
          placeholder={t("admin.slider_search_placeholder")}
          size="2"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
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

        {/* Search results */}
        {searchResults.length > 0 && (
          <ScrollArea style={{ maxHeight: 320 }}>
            <Flex direction="column" gap="2">
              {searchResults.map((manga) => {
                const title = getTitle(manga, locale);
                const alreadyAdded = isInSlider(manga.id);
                return (
                  <Card key={manga.id} size="1" variant="surface">
                    <Flex align="center" gap="3">
                      <Box
                        style={{
                          width: 36,
                          height: 52,
                          borderRadius: "var(--radius-2)",
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "var(--gray-a3)",
                          position: "relative",
                        }}
                      >
                        {manga.coverImage ? (
                          <Image
                            src={manga.coverImage}
                            alt={title}
                            fill
                            sizes="36px"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        ) : (
                          <Flex
                            align="center"
                            justify="center"
                            style={{ height: "100%" }}
                          >
                            <BookOpen
                              size={12}
                              style={{ color: "var(--gray-7)" }}
                            />
                          </Flex>
                        )}
                      </Box>

                      <Flex
                        direction="column"
                        gap="0"
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <Text size="2" weight="medium" truncate>
                          {title}
                        </Text>
                        <Text size="1" color="gray">
                          {manga.author?.name ?? manga.status}
                        </Text>
                      </Flex>

                      {alreadyAdded ? (
                        <Badge variant="soft" color="green" size="1">
                          <CheckCircle size={10} />
                          {t("admin.slider_added")}
                        </Badge>
                      ) : (
                        <IconButton
                          variant="soft"
                          size="1"
                          onClick={() => handleAdd(manga)}
                        >
                          <Plus size={14} />
                        </IconButton>
                      )}
                    </Flex>
                  </Card>
                );
              })}
            </Flex>
          </ScrollArea>
        )}
      </Flex>
    </Card>
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
