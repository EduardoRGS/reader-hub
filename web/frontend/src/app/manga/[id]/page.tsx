"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Section,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Button,
  Card,
  Callout,
  Separator,
  Spinner,
  Tabs,
  Box,
  Badge,
} from "@radix-ui/themes";
import {
  ArrowLeft,
  Star,
  Eye,
  Heart,
  BookOpen,
  User,
  Calendar,
  AlertCircle,
  Play,
  Download,
  Layers,
} from "lucide-react";
import {
  useMangaWithAuthor,
  useChaptersByMangaId,
  usePopulateChapters,
  useInvalidateMangas,
  usePrefetchChapters,
} from "@/hooks/queries";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChapterList } from "@/components/chapter/ChapterList";
import {
  getTitle,
  getDescription,
  formatNumber,
  formatRating,
  proxyCoverUrl,
} from "@/lib/utils";
import { useReaderStore } from "@/store/readerStore";
import { useLocale } from "@/hooks/useLocale";

export default function MangaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: manga, isLoading, isError, error } = useMangaWithAuthor(id);
  const { data: chapters, isLoading: chaptersLoading } =
    useChaptersByMangaId(id);
  const { getLastReadChapter } = useReaderStore();
  const populateChapters = usePopulateChapters();
  const { invalidateChapters } = useInvalidateMangas();
  const { locale, t } = useLocale();

  usePrefetchChapters(id);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="9" style={{ minHeight: 400 }}>
        <Spinner size="3" />
      </Flex>
    );
  }

  if (isError || !manga) {
    return (
      <Section size="2">
        <Container size="3" px="4">
          <Callout.Root color="red" size="2">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>
              {error?.message || t("manga.not_found")}
            </Callout.Text>
          </Callout.Root>
        </Container>
      </Section>
    );
  }

  const title = getTitle(manga, locale);
  const description = getDescription(manga, locale);
  const lastRead = getLastReadChapter(id);

  const sortedChapters = chapters
    ? [...chapters].sort((a, b) => a.number - b.number)
    : [];
  const firstChapter = sortedChapters[0];
  const continueChapter = lastRead
    ? chapters?.find((c) => c.id === lastRead.chapterId)
    : null;

  return (
    <div className="animate-fade-in">
      {/* ── Hero Banner ──────────────────────────────────── */}
      <Box
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 280,
        }}
      >
        {/* Blurred cover as background */}
        {manga.coverImage && (
          <Box
            style={{
              position: "absolute",
              inset: -20,
              backgroundImage: `url(${proxyCoverUrl(manga.coverImage)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(30px) brightness(0.4)",
              transform: "scale(1.1)",
            }}
          />
        )}
        {/* Gradient overlay */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            background: manga.coverImage
              ? "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)"
              : "linear-gradient(135deg, var(--accent-3) 0%, var(--gray-3) 100%)",
          }}
        />

        <Container size="4" px="4" style={{ position: "relative", zIndex: 1 }}>
          <Flex direction="column" gap="4" py="5">
            {/* Back button */}
            <Link href="/library" style={{ textDecoration: "none" }}>
              <Button
                variant="soft"
                size="2"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  color: manga.coverImage ? "white" : "var(--gray-12)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <ArrowLeft size={16} />
                {t("manga.back")}
              </Button>
            </Link>

            {/* Main info */}
            <Flex gap="5" align="end">
              {/* Cover card */}
              <Box
                className="animate-scale-in"
                style={{
                  width: 180,
                  flexShrink: 0,
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 16px 48px -8px rgba(0,0,0,0.4)",
                  border: "2px solid rgba(255,255,255,0.1)",
                  display: "none",
                }}
              >
                {/* Hidden on mobile, shown with media query */}
              </Box>

              <Grid
                columns={{ initial: "1", sm: "180px 1fr" }}
                gap="5"
                align="end"
                width="100%"
              >
                {/* Cover - visible on sm+ */}
                <Box
                  className="animate-scale-in"
                  display={{ initial: "none", sm: "block" }}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 16px 48px -8px rgba(0,0,0,0.4)",
                    border: "2px solid rgba(255,255,255,0.1)",
                    aspectRatio: "2/3",
                    position: "relative",
                  }}
                >
                  {manga.coverImage ? (
                    <Image
                      src={proxyCoverUrl(manga.coverImage)!}
                      alt={title}
                      fill
                      sizes="180px"
                      style={{ objectFit: "cover" }}
                      priority
                      unoptimized
                    />
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        height: "100%",
                        background: "var(--gray-a3)",
                      }}
                    >
                      <BookOpen
                        size={48}
                        style={{ color: "var(--gray-8)" }}
                      />
                    </Flex>
                  )}
                </Box>

                {/* Title & meta over banner */}
                <Flex
                  direction="column"
                  gap="3"
                  pb="1"
                  className="animate-slide-up"
                >
                  <Flex align="center" gap="2" wrap="wrap">
                    <StatusBadge status={manga.status} size="2" />
                    {manga.year && (
                      <Badge
                        size="2"
                        variant="soft"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: manga.coverImage
                            ? "white"
                            : "var(--gray-12)",
                        }}
                      >
                        <Calendar size={12} />
                        {manga.year}
                      </Badge>
                    )}
                  </Flex>

                  <Heading
                    size={{ initial: "7", sm: "8" }}
                    weight="bold"
                    style={{
                      color: manga.coverImage ? "white" : "var(--gray-12)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {title}
                  </Heading>

                  {manga.author && (
                    <Flex align="center" gap="2">
                      <User
                        size={14}
                        style={{
                          color: manga.coverImage
                            ? "rgba(255,255,255,0.7)"
                            : "var(--gray-9)",
                        }}
                      />
                      <Text
                        size="3"
                        style={{
                          color: manga.coverImage
                            ? "rgba(255,255,255,0.8)"
                            : "var(--gray-11)",
                        }}
                      >
                        {manga.author.name}
                      </Text>
                    </Flex>
                  )}

                  {/* Stats row */}
                  <Flex align="center" gap="4" wrap="wrap">
                    {manga.rating != null && (
                      <Flex
                        align="center"
                        gap="1"
                        px="2"
                        py="1"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "var(--radius-2)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <Star
                          size={14}
                          style={{ color: "var(--amber-9)" }}
                          fill="var(--amber-9)"
                        />
                        <Text
                          size="2"
                          weight="bold"
                          style={{
                            color: manga.coverImage
                              ? "white"
                              : "var(--gray-12)",
                          }}
                        >
                          {formatRating(manga.rating)}
                        </Text>
                        {manga.ratingCount != null && (
                          <Text
                            size="1"
                            style={{
                              color: manga.coverImage
                                ? "rgba(255,255,255,0.6)"
                                : "var(--gray-9)",
                            }}
                          >
                            ({formatNumber(manga.ratingCount)})
                          </Text>
                        )}
                      </Flex>
                    )}
                    {manga.views != null && (
                      <Flex align="center" gap="1">
                        <Eye
                          size={14}
                          style={{
                            color: manga.coverImage
                              ? "rgba(255,255,255,0.6)"
                              : "var(--gray-9)",
                          }}
                        />
                        <Text
                          size="2"
                          style={{
                            color: manga.coverImage
                              ? "rgba(255,255,255,0.8)"
                              : "var(--gray-11)",
                          }}
                        >
                          {formatNumber(manga.views)}
                        </Text>
                      </Flex>
                    )}
                    {manga.follows != null && (
                      <Flex align="center" gap="1">
                        <Heart
                          size={14}
                          style={{
                            color: manga.coverImage
                              ? "rgba(255,255,255,0.6)"
                              : "var(--gray-9)",
                          }}
                        />
                        <Text
                          size="2"
                          style={{
                            color: manga.coverImage
                              ? "rgba(255,255,255,0.8)"
                              : "var(--gray-11)",
                          }}
                        >
                          {formatNumber(manga.follows)}
                        </Text>
                      </Flex>
                    )}
                    <Flex align="center" gap="1">
                      <Layers
                        size={14}
                        style={{
                          color: manga.coverImage
                            ? "rgba(255,255,255,0.6)"
                            : "var(--gray-9)",
                        }}
                      />
                      <Text
                        size="2"
                        style={{
                          color: manga.coverImage
                            ? "rgba(255,255,255,0.8)"
                            : "var(--gray-11)",
                        }}
                      >
                        {chapters?.length ?? manga.totalChapters ?? 0}{" "}
                        {t("manga.chapters")}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Grid>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* ── Content ──────────────────────────────────────── */}
      <Section size="2">
        <Container size="4" px="4">
          <Flex direction="column" gap="5">
            {/* Action buttons */}
            <Flex gap="3" wrap="wrap" className="animate-slide-up">
              {continueChapter && (
                <Link href={`/manga/${id}/chapter/${continueChapter.id}`}>
                  <Button
                    size="3"
                    variant="solid"
                    style={{
                      boxShadow: "0 4px 16px -4px var(--accent-a6)",
                    }}
                  >
                    <Play size={16} />
                    {t("manga.continue", { number: continueChapter.number })}
                  </Button>
                </Link>
              )}
              {firstChapter && !continueChapter && (
                <Link href={`/manga/${id}/chapter/${firstChapter.id}`}>
                  <Button
                    size="3"
                    variant="solid"
                    style={{
                      boxShadow: "0 4px 16px -4px var(--accent-a6)",
                    }}
                  >
                    <Play size={16} />
                    {t("manga.start_reading")}
                  </Button>
                </Link>
              )}
              <Button
                size="3"
                variant="soft"
                color="gray"
                onClick={() =>
                  populateChapters.mutate(id, {
                    onSuccess: () => invalidateChapters(id),
                  })
                }
                disabled={populateChapters.isPending}
              >
                {populateChapters.isPending ? (
                  <Spinner size="1" />
                ) : (
                  <Download size={16} />
                )}
                {populateChapters.isPending
                  ? t("manga.importing")
                  : chapters?.length
                  ? t("manga.update_chapters")
                  : t("manga.import_chapters")}
              </Button>
            </Flex>

            <Separator size="4" />

            {/* Tabs */}
            <Tabs.Root defaultValue="chapters">
              <Tabs.List size="2">
                <Tabs.Trigger value="chapters">
                  <Flex align="center" gap="2">
                    <Layers size={14} />
                    {t("manga.tab_chapters")}
                  </Flex>
                </Tabs.Trigger>
                <Tabs.Trigger value="about">
                  <Flex align="center" gap="2">
                    <BookOpen size={14} />
                    {t("manga.tab_about")}
                  </Flex>
                </Tabs.Trigger>
              </Tabs.List>

              <Box pt="4">
                <Tabs.Content value="chapters">
                  {chaptersLoading ? (
                    <Flex justify="center" py="6">
                      <Spinner size="3" />
                    </Flex>
                  ) : (
                    <ChapterList chapters={chapters ?? []} mangaId={id} />
                  )}
                </Tabs.Content>

                <Tabs.Content value="about">
                  <Flex direction="column" gap="4">
                    {description ? (
                      <Card variant="surface" size="3">
                        <Text
                          size="3"
                          style={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}
                        >
                          {description}
                        </Text>
                      </Card>
                    ) : (
                      <Text size="2" color="gray">
                        {t("manga.no_description")}
                      </Text>
                    )}

                    {manga.author?.biography && (
                      <>
                        <Separator size="4" />
                        <Flex align="center" gap="2">
                          <User size={18} style={{ color: "var(--accent-9)" }} />
                          <Heading size="4">{t("manga.about_author")}</Heading>
                        </Flex>
                        <Card variant="surface" size="2">
                          <Text size="2" style={{ lineHeight: 1.7 }}>
                            {(locale === "pt-br"
                              ? manga.author.biography["pt-br"] ||
                                manga.author.biography.en
                              : manga.author.biography.en ||
                                manga.author.biography["pt-br"]) ||
                              t("manga.no_biography")}
                          </Text>
                        </Card>
                      </>
                    )}
                  </Flex>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Flex>
        </Container>
      </Section>
    </div>
  );
}
