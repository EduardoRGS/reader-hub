"use client";

import Image from "next/image";
import { Flex, Box } from "@radix-ui/themes";
import { BookOpen } from "lucide-react";
import { proxyCoverUrl } from "@/lib/utils";

interface MiniCoverProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  iconSize?: number;
}

/**
 * Componente reutilizável para exibir mini capas de mangá com fallback.
 * Substitui o padrão duplicado em Header, SliderManager, SearchResult, etc.
 */
export function MiniCover({
  src,
  alt,
  width = 36,
  height = 52,
  iconSize = 14,
}: MiniCoverProps) {
  const coverSrc = proxyCoverUrl(src);
  return (
    <Box
      style={{
        width,
        height,
        borderRadius: "var(--radius-2)",
        overflow: "hidden",
        flexShrink: 0,
        background: "var(--gray-a3)",
        position: "relative",
      }}
    >
      {coverSrc ? (
        <Image
          src={coverSrc}
          alt={alt}
          fill
          sizes={`${width}px`}
          style={{ objectFit: "cover" }}
          unoptimized
        />
      ) : (
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          <BookOpen size={iconSize} style={{ color: "var(--gray-7)" }} />
        </Flex>
      )}
    </Box>
  );
}
