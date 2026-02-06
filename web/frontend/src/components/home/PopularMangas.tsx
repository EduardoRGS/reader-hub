"use client";

import {
  Section,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Callout,
} from "@radix-ui/themes";
import { TrendingUp, AlertCircle } from "lucide-react";
import { usePopularMangas } from "@/hooks/queries";
import { MangaCard, MangaCardSkeleton } from "@/components/manga/MangaCard";
import { useLocale } from "@/hooks/useLocale";

export function PopularMangas() {
  const { data, isLoading, isError, error } = usePopularMangas();
  const { t } = useLocale();

  return (
    <Section size="2">
      <Container size="4" px="4">
        <Flex direction="column" gap="4">
          <Flex align="center" gap="2">
            <TrendingUp size={20} style={{ color: "var(--accent-9)" }} />
            <Heading size="5">{t("popular.title")}</Heading>
            <Text size="2" color="gray">
              {t("popular.subtitle")}
            </Text>
          </Flex>

          {isError && (
            <Callout.Root color="red" size="1">
              <Callout.Icon>
                <AlertCircle size={16} />
              </Callout.Icon>
              <Callout.Text>
                {error?.message || t("popular.error")}
              </Callout.Text>
            </Callout.Root>
          )}

          <Grid columns={{ initial: "2", sm: "3", md: "4" }} gap="4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <MangaCardSkeleton key={i} />
                ))
              : data?.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} />
                ))}
          </Grid>
        </Flex>
      </Container>
    </Section>
  );
}
