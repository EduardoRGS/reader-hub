"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Flex, Text, Box, Inset } from "@radix-ui/themes";
import { Star, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getTitle, formatNumber, formatRating } from "@/lib/utils";
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

  // Prefetch detalhes do mangá ao passar o mouse
  const handlePrefetch = useCallback(() => {
    qc.prefetchQuery({
      queryKey: queryKeys.mangaWithAuthor(manga.id),
      queryFn: ({ signal }) => mangaService.getMangaWithAuthor(manga.id, signal),
      staleTime: 10 * 60 * 1000,
    });
  }, [qc, manga.id]);

  return (
    <Link
      href={`/manga/${manga.id}`}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <Card
        size="1"
        style={{
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          overflow: "hidden",
        }}
        className="hover:scale-[1.02] hover:shadow-lg"
      >
        <Inset clip="padding-box" side="top">
          <Box
            style={{
              position: "relative",
              height: imageHeight,
              background: "var(--gray-a3)",
            }}
          >
            {manga.coverImage ? (
              <Image
                src={manga.coverImage}
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
                style={{ height: "100%" }}
              >
                <Text size="2" color="gray">
                  {t("general.no_cover")}
                </Text>
              </Flex>
            )}
            <Box style={{ position: "absolute", top: 8, left: 8 }}>
              <StatusBadge status={manga.status} />
            </Box>
          </Box>
        </Inset>

        <Flex direction="column" gap="1" pt="3" pb="1">
          <Text
            size="2"
            weight="medium"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Text>

          {manga.author && (
            <Text size="1" color="gray" truncate>
              {manga.author.name}
            </Text>
          )}

          <Flex align="center" gap="3" mt="1">
            {manga.rating != null && (
              <Flex align="center" gap="1">
                <Star
                  size={12}
                  style={{ color: "var(--amber-9)" }}
                  fill="var(--amber-9)"
                />
                <Text size="1" color="gray">
                  {formatRating(manga.rating)}
                </Text>
              </Flex>
            )}
            {manga.views != null && (
              <Flex align="center" gap="1">
                <Eye size={12} style={{ color: "var(--gray-9)" }} />
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
    <Card size="1">
      <Inset clip="padding-box" side="top">
        <Box
          style={{
            height: 300,
            background: "var(--gray-a3)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      </Inset>
      <Flex direction="column" gap="2" pt="3" pb="1">
        <Box
          style={{
            height: 16,
            width: "75%",
            background: "var(--gray-a4)",
            borderRadius: "var(--radius-1)",
          }}
        />
        <Box
          style={{
            height: 12,
            width: "50%",
            background: "var(--gray-a3)",
            borderRadius: "var(--radius-1)",
          }}
        />
      </Flex>
    </Card>
  );
}
