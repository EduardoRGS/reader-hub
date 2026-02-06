"use client";

import { Flex, Select, TextField, Card } from "@radix-ui/themes";
import { Search, Filter } from "lucide-react";
import type { MangaStatus } from "@/types/manga";
import { useLocale } from "@/hooks/useLocale";

interface LibraryFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const STATUS_KEYS: MangaStatus[] = [
  "ongoing",
  "completed",
  "hiatus",
  "cancelled",
];

export function LibraryFilters({
  status,
  onStatusChange,
  search,
  onSearchChange,
}: LibraryFiltersProps) {
  const { t } = useLocale();

  return (
    <Card variant="surface" size="2" className="glass-subtle">
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
              <Search size={14} />
            </TextField.Slot>
          </TextField.Root>

          <Flex align="center" gap="2">
            <Filter size={14} style={{ color: "var(--gray-9)" }} />
            <Select.Root value={status} onValueChange={onStatusChange}>
              <Select.Trigger placeholder={t("library.all_status")} />
              <Select.Content>
                <Select.Item value="all">
                  {t("library.all_status")}
                </Select.Item>
                {STATUS_KEYS.map((s) => (
                  <Select.Item key={s} value={s}>
                    {t(`status.${s}`)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
