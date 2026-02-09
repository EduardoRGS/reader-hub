"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Flex, Text, Box, Inset } from "@radix-ui/themes";
import { Star, Eye, BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getTitle, formatNumber, formatRating, proxyCoverUrl } from "@/lib/utils";
import { useLocale } from "@/hooks/useLocale";
import { queryKeys } from "@/hooks/queries";
import { mangaService } from "@/services/api";
import type { Manga } from "@/types/manga";

interface MangaCardProps {
  manga: Manga;
  size?: "sm" | "md" | "lg";
}

export const MangaCard = memo(function MangaCard({
  manga,
  size = "md",
}: MangaCardProps) {
  const { locale, t } = useLocale();
  const title = getTitle(manga, locale);
  const imageHeight = size === "lg" ? 380 : size === "md" ? 300 : 240;
  const qc = useQueryClient();

  const handlePrefetch = useCallback(() => {
    qc.prefetchQuery({
      queryKey: queryKeys.mangaWithAuthor(manga.id),
      queryFn: ({ signal }) =>
        mangaService.getMangaWithAuthor(manga.id, signal),
      staleTime: 10 * 60 * 1000,
    });
  }, [qc, manga.id]);

  return (
    <Link
      href={`/manga/${manga.id}`}
      style={{ textDecoration: "none", display: "block", height: "100%" }}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <Card
        size="1"
        className="card-hover"
        style={{
          overflow: "hidden",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Inset clip="padding-box" side="top">
          <Box
            className="cover-overlay"
            style={{
              position: "relative",
              height: imageHeight,
              background: "var(--gray-a3)",
            }}
          >
            {manga.coverImage ? (
              <Image
                src={proxyCoverUrl(manga.coverImage)!}
                alt={title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <Flex
                align="center"
                justify="center"
                direction="column"
                gap="2"
                style={{ height: "100%" }}
              >
                <BookOpen size={32} style={{ color: "var(--gray-7)" }} />
                <Text size="1" color="gray">
                  {t("general.no_cover")}
                </Text>
              </Flex>
            )}

            {/* Status badge */}
            <Box style={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}>
              <StatusBadge status={manga.status} />
            </Box>

            {/* Rating overlay on cover */}
            {manga.rating != null && (
              <Flex
                align="center"
                gap="1"
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  zIndex: 2,
                  background: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "var(--radius-2)",
                  padding: "2px 8px",
                }}
              >
                <Star
                  size={11}
                  style={{ color: "var(--amber-9)" }}
                  fill="var(--amber-9)"
                />
                <Text size="1" style={{ color: "white", fontWeight: 600 }}>
                  {formatRating(manga.rating)}
                </Text>
              </Flex>
            )}
          </Box>
        </Inset>

        {/* Info section - fixed height to keep cards uniform */}
        <Flex
          direction="column"
          gap="1"
          pt="3"
          pb="1"
          px="1"
          style={{ flex: 1, minHeight: 72 }}
        >
          <Text
            size="2"
            weight="bold"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Text>

          <Text
            size="1"
            color="gray"
            truncate
            style={{ minHeight: 18 }}
          >
            {manga.author?.name ?? "\u00A0"}
          </Text>

          <Flex align="center" gap="3" mt="auto">
            {manga.views != null && (
              <Flex align="center" gap="1">
                <Eye size={11} style={{ color: "var(--gray-8)" }} />
                <Text size="1" color="gray">
                  {formatNumber(manga.views)}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
});

export function MangaCardSkeleton() {
  return (
    <Card size="1" style={{ overflow: "hidden" }}>
      <Inset clip="padding-box" side="top">
        <Box className="animate-shimmer" style={{ height: 300 }} />
      </Inset>
      <Flex direction="column" gap="2" pt="3" pb="1">
        <Box
          className="animate-shimmer"
          style={{
            height: 16,
            width: "75%",
            borderRadius: "var(--radius-1)",
          }}
        />
        <Box
          className="animate-shimmer"
          style={{
            height: 12,
            width: "50%",
            borderRadius: "var(--radius-1)",
          }}
        />
      </Flex>
    </Card>
  );
}
