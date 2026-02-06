"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flex,
  Container,
  Text,
  IconButton,
  Tooltip,
  Separator,
} from "@radix-ui/themes";
import { BookOpen, Library, Settings, Home } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { useLocale } from "@/hooks/useLocale";

const NAV_KEYS = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/library", labelKey: "nav.library", icon: Library },
  { href: "/admin", labelKey: "nav.admin", icon: Settings },
] as const;

export function Header() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--gray-a5)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--color-background)",
      }}
    >
      <Container size="4" px="4">
        <Flex align="center" justify="between" py="3">
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <Flex align="center" gap="2">
              <BookOpen size={24} style={{ color: "var(--accent-9)" }} />
              <Text size="5" weight="bold" style={{ color: "var(--accent-11)" }}>
                {t("app.name")}
              </Text>
            </Flex>
          </Link>

          {/* Navigation + controls */}
          <Flex align="center" gap="1">
            {NAV_KEYS.map(({ href, labelKey, icon: Icon }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Tooltip key={href} content={t(labelKey)}>
                  <Link href={href}>
                    <IconButton
                      variant={isActive ? "soft" : "ghost"}
                      size="2"
                      color={isActive ? "iris" : "gray"}
                      aria-label={t(labelKey)}
                    >
                      <Icon size={18} />
                    </IconButton>
                  </Link>
                </Tooltip>
              );
            })}

            <Separator orientation="vertical" size="1" style={{ height: 20 }} />

            <LanguageSelector />
            <ThemeToggle />
          </Flex>
        </Flex>
      </Container>
    </header>
  );
}
