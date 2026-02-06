"use client";

import { Flex, Select, TextField, Text } from "@radix-ui/themes";
import { Search } from "lucide-react";
import type { MangaStatus } from "@/types/manga";
import { useLocale } from "@/hooks/useLocale";

interface LibraryFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  totalResults?: number;
}

const STATUS_KEYS: MangaStatus[] = ["ongoing", "completed", "hiatus", "cancelled"];

export function LibraryFilters({
  status,
  onStatusChange,
  search,
  onSearchChange,
  totalResults,
}: LibraryFiltersProps) {
  const { t } = useLocale();

  return (
    <Flex
      direction={{ initial: "column", sm: "row" }}
      align={{ initial: "stretch", sm: "center" }}
      justify="between"
      gap="3"
    >
      <Flex align="center" gap="3" wrap="wrap">
        <TextField.Root
          placeholder={t("library.search")}
          size="2"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ minWidth: 240 }}
        >
          <TextField.Slot>
            <Search size={16} />
          </TextField.Slot>
        </TextField.Root>

        <Select.Root value={status} onValueChange={onStatusChange}>
          <Select.Trigger placeholder={t("library.all_status")} />
          <Select.Content>
            <Select.Item value="all">{t("library.all_status")}</Select.Item>
            {STATUS_KEYS.map((s) => (
              <Select.Item key={s} value={s}>
                {t(`status.${s}`)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      {totalResults != null && (
        <Text size="2" color="gray">
          {t("library.results", { count: totalResults })}
        </Text>
      )}
    </Flex>
  );
}
