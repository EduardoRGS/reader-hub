"use client";

import {
  Flex,
  Text,
  Card,
  Badge,
  Button,
  DataList,
  Spinner,
} from "@radix-ui/themes";
import { Database, BookOpen, Users, Layers, RefreshCw } from "lucide-react";
import { usePopulationStats } from "@/hooks/queries";
import { useLocale } from "@/hooks/useLocale";

export function StatsCard() {
  const { data, isLoading, isError, refetch } = usePopulationStats();
  const { t } = useLocale();

  return (
    <Card size="3">
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Database size={18} style={{ color: "var(--accent-9)" }} />
            <Text size="3" weight="bold">
              {t("admin.stats_title")}
            </Text>
          </Flex>
          <Button
            variant="ghost"
            size="1"
            color="gray"
            onClick={() => refetch()}
          >
            <RefreshCw size={14} />
          </Button>
        </Flex>

        {isLoading && <Spinner size="2" />}
        {isError && (
          <Text size="2" color="red">
            {t("admin.stats_error")}
          </Text>
        )}

        {data && (
          <DataList.Root size="2">
            <DataList.Item>
              <DataList.Label>
                <Flex align="center" gap="1">
                  <BookOpen size={14} />
                  {t("admin.stats_mangas")}
                </Flex>
              </DataList.Label>
              <DataList.Value>
                <Badge variant="soft" color="iris" size="2">
                  {data.totalMangas}
                </Badge>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>
                <Flex align="center" gap="1">
                  <Users size={14} />
                  {t("admin.stats_authors")}
                </Flex>
              </DataList.Label>
              <DataList.Value>
                <Badge variant="soft" color="cyan" size="2">
                  {data.totalAuthors}
                </Badge>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>
                <Flex align="center" gap="1">
                  <Layers size={14} />
                  {t("admin.stats_chapters")}
                </Flex>
              </DataList.Label>
              <DataList.Value>
                <Badge variant="soft" color="green" size="2">
                  {data.totalChapters}
                </Badge>
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>
        )}
      </Flex>
    </Card>
  );
}
