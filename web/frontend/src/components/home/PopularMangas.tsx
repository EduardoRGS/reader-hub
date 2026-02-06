"use client";

import Link from "next/link";
import {
  Section,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Callout,
  Button,
  Box,
} from "@radix-ui/themes";
import { TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { usePopularMangas } from "@/hooks/queries";
import { MangaCard, MangaCardSkeleton } from "@/components/manga/MangaCard";
import { useLocale } from "@/hooks/useLocale";

export function PopularMangas() {
  const { data, isLoading, isError, error } = usePopularMangas();
  const { t } = useLocale();

  return (
    <Section size="2">
      <Container size="4" px="4">
        <Flex direction="column" gap="5">
          <Flex align="center" justify="between">
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--accent-a3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp size={18} style={{ color: "var(--accent-9)" }} />
              </Box>
              <Flex direction="column">
                <Heading size="5" weight="bold">
                  {t("popular.title")}
                </Heading>
                <Text size="2" color="gray">
                  {t("popular.subtitle")}
                </Text>
              </Flex>
            </Flex>
            <Link href="/library" style={{ textDecoration: "none" }}>
              <Button variant="ghost" color="gray" size="2">
                {t("hero.explore")}
                <ArrowRight size={14} />
              </Button>
            </Link>
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

          <Grid
            columns={{ initial: "2", sm: "3", md: "4" }}
            gap="4"
            className="stagger-children"
          >
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
