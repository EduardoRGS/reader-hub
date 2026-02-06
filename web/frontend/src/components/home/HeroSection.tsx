"use client";

import Link from "next/link";
import { Section, Container, Flex, Heading, Text, Button } from "@radix-ui/themes";
import { BookOpen, Library } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

export function HeroSection() {
  const { t } = useLocale();

  return (
    <Section
      size="3"
      style={{
        background:
          "linear-gradient(135deg, var(--accent-3) 0%, var(--accent-2) 50%, var(--gray-2) 100%)",
        borderBottom: "1px solid var(--gray-a4)",
      }}
    >
      <Container size="3" px="4">
        <Flex direction="column" align="center" gap="5" py="6">
          <Flex
            align="center"
            justify="center"
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-4)",
              background: "var(--accent-9)",
              color: "white",
            }}
          >
            <BookOpen size={32} />
          </Flex>

          <Flex direction="column" align="center" gap="2">
            <Heading size="8" align="center" weight="bold">
              {t("app.name")}
            </Heading>
            <Text
              size="4"
              color="gray"
              align="center"
              style={{ maxWidth: 500 }}
            >
              {t("app.tagline")}
            </Text>
          </Flex>

          <Flex gap="3" wrap="wrap" justify="center">
            <Link href="/library">
              <Button size="3" variant="solid">
                <Library size={16} />
                {t("hero.explore")}
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="3" variant="soft" color="gray">
                {t("hero.admin")}
              </Button>
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Section>
  );
}
