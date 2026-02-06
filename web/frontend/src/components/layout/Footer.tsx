"use client";

import { Container, Flex, Text, Separator, Link as RadixLink } from "@radix-ui/themes";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer style={{ borderTop: "1px solid var(--gray-a5)" }}>
      <Container size="4" px="4" py="6">
        <Flex direction="column" gap="4">
          <Flex
            align={{ initial: "start", sm: "center" }}
            justify="between"
            direction={{ initial: "column", sm: "row" }}
            gap="4"
          >
            <Flex align="center" gap="2">
              <BookOpen size={20} style={{ color: "var(--accent-9)" }} />
              <Text size="3" weight="bold" color="gray">
                {t("app.name")}
              </Text>
            </Flex>

            <Flex gap="4">
              <Link href="/" passHref legacyBehavior>
                <RadixLink size="2" color="gray">
                  {t("nav.home")}
                </RadixLink>
              </Link>
              <Link href="/library" passHref legacyBehavior>
                <RadixLink size="2" color="gray">
                  {t("nav.library")}
                </RadixLink>
              </Link>
              <Link href="/admin" passHref legacyBehavior>
                <RadixLink size="2" color="gray">
                  {t("nav.admin")}
                </RadixLink>
              </Link>
            </Flex>
          </Flex>

          <Separator size="4" />

          <Text size="1" color="gray" align="center">
            {t("footer.disclaimer", { year: new Date().getFullYear() })}
          </Text>
        </Flex>
      </Container>
    </footer>
  );
}
