"use client";

import Link from "next/link";
import {
  Section,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Box,
} from "@radix-ui/themes";
import { BookOpen, Library, ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

export function HeroSection() {
  const { t } = useLocale();

  return (
    <Section
      size="1"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 480,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Animated gradient background */}
      <Box
        className="animate-gradient"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, var(--accent-3) 0%, var(--accent-2) 25%, var(--gray-2) 50%, var(--accent-2) 75%, var(--accent-3) 100%)",
          backgroundSize: "200% 200%",
          zIndex: 0,
        }}
      />

      {/* Decorative shapes */}
      <Box
        className="animate-float"
        style={{
          position: "absolute",
          top: "10%",
          right: "8%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--accent-a4) 0%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: "15%",
          left: "5%",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--accent-a3) 0%, transparent 70%)",
          filter: "blur(30px)",
          zIndex: 0,
          animation: "float 4s ease-in-out infinite reverse",
        }}
      />

      {/* Grid pattern overlay */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(var(--gray-a3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          zIndex: 0,
          opacity: 0.5,
        }}
      />

      <Container size="3" px="4" style={{ position: "relative", zIndex: 1 }}>
        <Flex direction="column" align="center" gap="6" py="8">
          {/* Icon with glow */}
          <Box
            className="animate-glow animate-scale-in"
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background:
                "linear-gradient(135deg, var(--accent-9) 0%, var(--accent-10) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 8px 32px -4px var(--accent-a6)",
            }}
          >
            <BookOpen size={36} strokeWidth={1.5} />
          </Box>

          {/* Text content */}
          <Flex
            direction="column"
            align="center"
            gap="3"
            className="animate-slide-up"
          >
            <Heading
              size="9"
              align="center"
              weight="bold"
              className="gradient-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              {t("app.name")}
            </Heading>
            <Text
              size="4"
              align="center"
              style={{
                maxWidth: 520,
                color: "var(--gray-11)",
                lineHeight: 1.6,
              }}
            >
              {t("app.tagline")}
            </Text>
          </Flex>

          {/* Stats pills */}
          <Flex
            gap="3"
            wrap="wrap"
            justify="center"
            className="animate-slide-up"
            style={{ animationDelay: "150ms" }}
          >
            <Flex
              align="center"
              gap="2"
              px="3"
              py="1"
              style={{
                background: "var(--accent-a3)",
                borderRadius: "var(--radius-4)",
                border: "1px solid var(--accent-a5)",
              }}
            >
              <Sparkles size={14} style={{ color: "var(--accent-9)" }} />
              <Text size="2" weight="medium" style={{ color: "var(--accent-11)" }}>
                {t("hero.feature_catalog")}
              </Text>
            </Flex>
            <Flex
              align="center"
              gap="2"
              px="3"
              py="1"
              style={{
                background: "var(--accent-a3)",
                borderRadius: "var(--radius-4)",
                border: "1px solid var(--accent-a5)",
              }}
            >
              <BookOpen size={14} style={{ color: "var(--accent-9)" }} />
              <Text size="2" weight="medium" style={{ color: "var(--accent-11)" }}>
                {t("hero.feature_reader")}
              </Text>
            </Flex>
          </Flex>

          {/* CTA buttons */}
          <Flex
            gap="3"
            wrap="wrap"
            justify="center"
            className="animate-slide-up"
            style={{ animationDelay: "250ms" }}
          >
            <Link href="/library">
              <Button
                size="3"
                variant="solid"
                style={{
                  paddingLeft: 24,
                  paddingRight: 24,
                  boxShadow: "0 4px 16px -4px var(--accent-a6)",
                }}
              >
                <Library size={16} />
                {t("hero.explore")}
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                size="3"
                variant="outline"
                color="gray"
                style={{ paddingLeft: 24, paddingRight: 24 }}
              >
                {t("hero.admin")}
              </Button>
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Section>
  );
}
