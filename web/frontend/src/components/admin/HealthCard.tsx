"use client";

import {
  Flex,
  Text,
  Card,
  Button,
  Callout,
  Spinner,
} from "@radix-ui/themes";
import { Activity, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useHealthCheck } from "@/hooks/queries";
import { useLocale } from "@/hooks/useLocale";

export function HealthCard() {
  const { data, isLoading, isError, refetch } = useHealthCheck();
  const { t } = useLocale();

  return (
    <Card size="3">
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Activity size={18} style={{ color: "var(--green-9)" }} />
            <Text size="3" weight="bold">
              {t("admin.health_title")}
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
          <Callout.Root color="red" size="1">
            <Callout.Icon>
              <AlertCircle size={14} />
            </Callout.Icon>
            <Callout.Text>{t("admin.health_down")}</Callout.Text>
          </Callout.Root>
        )}

        {data && (
          <Callout.Root
            color={data.status === "UP" ? "green" : "orange"}
            size="1"
          >
            <Callout.Icon>
              <CheckCircle size={14} />
            </Callout.Icon>
            <Callout.Text>
              {data.message || t("admin.health_up")}
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </Card>
  );
}
