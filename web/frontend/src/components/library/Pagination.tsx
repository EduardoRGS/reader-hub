"use client";

import { Flex, Button, Text, IconButton } from "@radix-ui/themes";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Quantos botões de página mostrar ao redor da página atual */
  siblingCount?: number;
}

/**
 * Gera a lista de números de página a exibir.
 * Ex: [1, '...', 4, 5, 6, '...', 20]
 */
function getPageRange(
  current: number,
  total: number,
  siblings: number
): (number | "dots")[] {
  const range: (number | "dots")[] = [];

  const leftSibling = Math.max(current - siblings, 0);
  const rightSibling = Math.min(current + siblings, total - 1);

  const showLeftDots = leftSibling > 1;
  const showRightDots = rightSibling < total - 2;

  // Always show first page
  range.push(0);

  if (showLeftDots) {
    range.push("dots");
  } else {
    for (let i = 1; i < leftSibling; i++) {
      range.push(i);
    }
  }

  // Sibling range
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 0 && i !== total - 1) {
      range.push(i);
    }
  }

  if (showRightDots) {
    range.push("dots");
  } else {
    for (let i = rightSibling + 1; i < total - 1; i++) {
      range.push(i);
    }
  }

  // Always show last page (if more than 1 page)
  if (total > 1) {
    range.push(total - 1);
  }

  return range;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const { t } = useLocale();

  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages, siblingCount);
  const isFirst = currentPage === 0;
  const isLast = currentPage >= totalPages - 1;

  return (
    <Flex align="center" justify="center" gap="1" wrap="wrap" py="4">
      {/* First page */}
      <IconButton
        variant="soft"
        color="gray"
        size="2"
        disabled={isFirst}
        onClick={() => onPageChange(0)}
        aria-label={t("pagination.first")}
      >
        <ChevronsLeft size={16} />
      </IconButton>

      {/* Previous */}
      <IconButton
        variant="soft"
        color="gray"
        size="2"
        disabled={isFirst}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label={t("pagination.prev")}
      >
        <ChevronLeft size={16} />
      </IconButton>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === "dots" ? (
          <Text
            key={`dots-${idx}`}
            size="2"
            color="gray"
            style={{ padding: "0 4px", userSelect: "none" }}
          >
            ...
          </Text>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "solid" : "soft"}
            color={page === currentPage ? "iris" : "gray"}
            size="2"
            onClick={() => onPageChange(page)}
            style={{ minWidth: 36 }}
          >
            {page + 1}
          </Button>
        )
      )}

      {/* Next */}
      <IconButton
        variant="soft"
        color="gray"
        size="2"
        disabled={isLast}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label={t("pagination.next")}
      >
        <ChevronRight size={16} />
      </IconButton>

      {/* Last page */}
      <IconButton
        variant="soft"
        color="gray"
        size="2"
        disabled={isLast}
        onClick={() => onPageChange(totalPages - 1)}
        aria-label={t("pagination.last")}
      >
        <ChevronsRight size={16} />
      </IconButton>
    </Flex>
  );
}
