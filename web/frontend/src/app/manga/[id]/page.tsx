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
  DataList,
  Separator,
  Spinner,
  Tabs,
  Box,
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

  // Prefetch capítulos em paralelo com os dados do mangá
  usePrefetchChapters(id);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="9">
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
    <Section size="2">
      <Container size="4" px="4">
        <Flex direction="column" gap="5">
          {/* Back */}
          <Link href="/library" style={{ textDecoration: "none" }}>
            <Button variant="ghost" color="gray" size="2">
              <ArrowLeft size={16} />
              {t("manga.back")}
            </Button>
          </Link>

          {/* Info grid */}
          <Grid columns={{ initial: "1", sm: "240px 1fr" }} gap="5">
            {/* Cover */}
            <Card size="1" style={{ overflow: "hidden" }}>
              <Box
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "2/3",
                  background: "var(--gray-a3)",
                }}
              >
                {manga.coverImage ? (
                  <Image
                    src={manga.coverImage}
                    alt={title}
                    fill
                    sizes="240px"
                    style={{ objectFit: "cover" }}
                    priority
                    unoptimized
                  />
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ height: "100%" }}
                  >
                    <BookOpen size={48} style={{ color: "var(--gray-8)" }} />
                  </Flex>
                )}
              </Box>
            </Card>

            {/* Details */}
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2" wrap="wrap">
                  <Heading size="7">{title}</Heading>
                  <StatusBadge status={manga.status} size="2" />
                </Flex>

                {manga.author && (
                  <Flex align="center" gap="1">
                    <User size={14} style={{ color: "var(--gray-9)" }} />
                    <Text size="3" color="gray">
                      {manga.author.name}
                    </Text>
                  </Flex>
                )}
              </Flex>

              {/* Stats */}
              <DataList.Root size="2">
                {manga.rating != null && (
                  <DataList.Item>
                    <DataList.Label>
                      <Flex align="center" gap="1">
                        <Star size={14} />
                        {t("manga.rating")}
                      </Flex>
                    </DataList.Label>
                    <DataList.Value>
                      {formatRating(manga.rating)}
                      {manga.ratingCount != null && (
                        <Text size="1" color="gray">
                          {" "}
                          ({t("manga.votes", { count: formatNumber(manga.ratingCount) })})
                        </Text>
                      )}
                    </DataList.Value>
                  </DataList.Item>
                )}
                {manga.views != null && (
                  <DataList.Item>
                    <DataList.Label>
                      <Flex align="center" gap="1">
                        <Eye size={14} />
                        {t("manga.views")}
                      </Flex>
                    </DataList.Label>
                    <DataList.Value>
                      {formatNumber(manga.views)}
                    </DataList.Value>
                  </DataList.Item>
                )}
                {manga.follows != null && (
                  <DataList.Item>
                    <DataList.Label>
                      <Flex align="center" gap="1">
                        <Heart size={14} />
                        {t("manga.follows")}
                      </Flex>
                    </DataList.Label>
                    <DataList.Value>
                      {formatNumber(manga.follows)}
                    </DataList.Value>
                  </DataList.Item>
                )}
                {manga.year && (
                  <DataList.Item>
                    <DataList.Label>
                      <Flex align="center" gap="1">
                        <Calendar size={14} />
                        {t("manga.year")}
                      </Flex>
                    </DataList.Label>
                    <DataList.Value>{manga.year}</DataList.Value>
                  </DataList.Item>
                )}
                <DataList.Item>
                  <DataList.Label>
                    <Flex align="center" gap="1">
                      <BookOpen size={14} />
                      {t("manga.chapters")}
                    </Flex>
                  </DataList.Label>
                  <DataList.Value>
                    {chapters?.length ?? manga.totalChapters ?? 0}
                  </DataList.Value>
                </DataList.Item>
              </DataList.Root>

              {/* Action buttons */}
              <Flex gap="3" wrap="wrap">
                {continueChapter && (
                  <Link href={`/manga/${id}/chapter/${continueChapter.id}`}>
                    <Button size="3" variant="solid">
                      <Play size={16} />
                      {t("manga.continue", { number: continueChapter.number })}
                    </Button>
                  </Link>
                )}
                {firstChapter && !continueChapter && (
                  <Link href={`/manga/${id}/chapter/${firstChapter.id}`}>
                    <Button size="3" variant="solid">
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
            </Flex>
          </Grid>

          <Separator size="4" />

          {/* Tabs */}
          <Tabs.Root defaultValue="chapters">
            <Tabs.List>
              <Tabs.Trigger value="chapters">
                {t("manga.tab_chapters")}
              </Tabs.Trigger>
              <Tabs.Trigger value="about">
                {t("manga.tab_about")}
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
                    <Text
                      size="3"
                      style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}
                    >
                      {description}
                    </Text>
                  ) : (
                    <Text size="2" color="gray">
                      {t("manga.no_description")}
                    </Text>
                  )}

                  {manga.author?.biography && (
                    <>
                      <Separator size="4" />
                      <Heading size="4">{t("manga.about_author")}</Heading>
                      <Text size="2" color="gray">
                        {(locale === "pt-br"
                          ? manga.author.biography["pt-br"] ||
                            manga.author.biography.en
                          : manga.author.biography.en ||
                            manga.author.biography["pt-br"]) ||
                          t("manga.no_biography")}
                      </Text>
                    </>
                  )}
                </Flex>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Flex>
      </Container>
    </Section>
  );
}
