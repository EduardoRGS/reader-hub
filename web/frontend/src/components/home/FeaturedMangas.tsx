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
import { Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { useFeaturedMangas } from "@/hooks/queries";
import { MangaCard, MangaCardSkeleton } from "@/components/manga/MangaCard";
import { useLocale } from "@/hooks/useLocale";

export function FeaturedMangas() {
  const { data, isLoading, isError, error } = useFeaturedMangas();
  const { t } = useLocale();

  return (
    <Section size="2" className="section-accent" pt="7">
      <Container size="4" px="4">
        <Flex direction="column" gap="5">
          <Flex align="center" justify="between">
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--amber-a3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={18} style={{ color: "var(--amber-9)" }} />
              </Box>
              <Flex direction="column">
                <Heading size="5" weight="bold">
                  {t("featured.title")}
                </Heading>
                <Text size="2" color="gray">
                  {t("featured.subtitle")}
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
                {error?.message || t("featured.error")}
              </Callout.Text>
            </Callout.Root>
          )}

          <Grid
            columns={{ initial: "2", sm: "3", md: "4" }}
            gap="4"
            className="stagger-children"
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <MangaCardSkeleton key={i} />
                ))
              : data?.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} size="lg" />
                ))}
          </Grid>
        </Flex>
      </Container>
    </Section>
  );
}
