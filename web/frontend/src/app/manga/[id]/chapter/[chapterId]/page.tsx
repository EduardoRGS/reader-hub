"use client";

import { use } from "react";
import {
  Flex,
  Container,
  Spinner,
  Callout,
  Text,
  Button,
} from "@radix-ui/themes";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useChapterWithImages, useChaptersByMangaId } from "@/hooks/queries";
import { ChapterReader } from "@/components/chapter/ChapterReader";
import { useLocale } from "@/hooks/useLocale";

export default function ChapterReaderPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id: mangaId, chapterId } = use(params);
  const { t } = useLocale();

  const {
    data: chapter,
    isLoading: chapterLoading,
    isError: chapterError,
    error: chapterErr,
  } = useChapterWithImages(chapterId);

  const { data: chapters, isLoading: chaptersLoading } =
    useChaptersByMangaId(mangaId);

  const isLoading = chapterLoading || chaptersLoading;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="9" style={{ minHeight: "60vh" }}>
        <Flex direction="column" align="center" gap="3">
          <Spinner size="3" />
          <Text size="2" color="gray">
            {t("reader.loading")}
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (chapterError || !chapter) {
    return (
      <Container size="2" px="4" py="6">
        <Flex direction="column" gap="4">
          <Callout.Root color="red" size="2">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>
              {chapterErr?.message || t("reader.not_found")}
            </Callout.Text>
          </Callout.Root>
          <Link href={`/manga/${mangaId}`}>
            <Button variant="soft" color="gray">
              <ArrowLeft size={16} />
              {t("reader.back_to_manga")}
            </Button>
          </Link>
        </Flex>
      </Container>
    );
  }

  return (
    <ChapterReader
      chapter={chapter}
      chapters={chapters ?? []}
      mangaId={mangaId}
    />
  );
}
