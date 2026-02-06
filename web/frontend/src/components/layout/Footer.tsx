"use client";

import {
  Container,
  Flex,
  Text,
  Box,
  Link as RadixLink,
} from "@radix-ui/themes";
import { BookOpen, Heart } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer
      style={{
        position: "relative",
        borderTop: "1px solid var(--gray-a4)",
      }}
    >
      {/* Gradient top accent */}
      <Box
        style={{
          position: "absolute",
          top: -1,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(400px, 80%)",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--accent-9), transparent)",
        }}
      />

      <Container size="4" px="4" py="6">
        <Flex direction="column" gap="5">
          <Flex
            align={{ initial: "start", sm: "center" }}
            justify="between"
            direction={{ initial: "column", sm: "row" }}
            gap="4"
          >
            {/* Logo area */}
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background:
                    "linear-gradient(135deg, var(--accent-9), var(--accent-10))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <BookOpen size={14} />
              </Box>
              <Text size="3" weight="bold" className="gradient-text">
                {t("app.name")}
              </Text>
            </Flex>

            {/* Navigation links */}
            <Flex gap="5" align="center">
              <Link href="/" passHref legacyBehavior>
                <RadixLink
                  size="2"
                  color="gray"
                  highContrast
                  style={{ transition: "color 0.2s" }}
                >
                  {t("nav.home")}
                </RadixLink>
              </Link>
              <Link href="/library" passHref legacyBehavior>
                <RadixLink
                  size="2"
                  color="gray"
                  highContrast
                  style={{ transition: "color 0.2s" }}
                >
                  {t("nav.library")}
                </RadixLink>
              </Link>
              <Link href="/admin" passHref legacyBehavior>
                <RadixLink
                  size="2"
                  color="gray"
                  highContrast
                  style={{ transition: "color 0.2s" }}
                >
                  {t("nav.admin")}
                </RadixLink>
              </Link>
            </Flex>
          </Flex>

          {/* Divider */}
          <Box
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, var(--gray-a5), transparent)",
            }}
          />

          {/* Bottom row */}
          <Flex
            align="center"
            justify="between"
            direction={{ initial: "column", sm: "row" }}
            gap="2"
          >
            <Text size="1" color="gray">
              {t("footer.disclaimer", { year: new Date().getFullYear() })}
            </Text>
            <Flex align="center" gap="1">
              <Text size="1" color="gray">
                Made with
              </Text>
              <Heart
                size={12}
                style={{ color: "var(--red-9)" }}
                fill="var(--red-9)"
              />
              <Text size="1" color="gray">
                & Next.js
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Container>
    </footer>
  );
}
