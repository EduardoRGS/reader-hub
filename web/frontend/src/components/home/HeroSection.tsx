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
import { StarField } from "@/components/home/StarField";

export function HeroSection() {
  const { t } = useLocale();

  return (
    <Section
      size="1"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 520,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* ─── Animated gradient background ─────────────────── */}
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

      {/* ─── Morphing color blobs ─────────────────────────── */}
      <div
        className="animate-blob"
        style={{
          position: "absolute",
          top: "5%",
          right: "10%",
          width: 280,
          height: 280,
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          background:
            "radial-gradient(circle, var(--accent-a4) 0%, transparent 70%)",
          filter: "blur(50px)",
          zIndex: 0,
          opacity: 0.7,
        }}
      />
      <div
        className="animate-blob-delay"
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: 220,
          height: 220,
          borderRadius: "40% 60% 70% 30% / 50% 60% 30% 60%",
          background:
            "radial-gradient(circle, var(--accent-a3) 0%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0,
          opacity: 0.6,
        }}
      />
      <div
        className="animate-blob-delay-2"
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: 180,
          height: 180,
          borderRadius: "50% 40% 60% 50% / 40% 50% 60% 50%",
          background:
            "radial-gradient(circle, var(--iris-a3) 0%, transparent 70%)",
          filter: "blur(45px)",
          zIndex: 0,
          opacity: 0.5,
        }}
      />

      {/* ─── ✨ Starfield ─────────────────────────────────── */}
      <StarField count={55} variant="auto" />

      {/* ─── Animated grid pattern ────────────────────────── */}
      <Box
        className="hero-bg-grid animate-fade-in"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.2,
        }}
      />

      {/* ─── Drifting shapes ──────────────────────────────── */}
      <div
        className="animate-drift"
        style={{
          position: "absolute",
          top: "20%",
          right: "25%",
          width: 40,
          height: 40,
          border: "2px solid var(--accent-a4)",
          borderRadius: "var(--radius-3)",
          zIndex: 0,
          opacity: 0.4,
        }}
      />
      <div
        className="animate-drift-reverse"
        style={{
          position: "absolute",
          bottom: "30%",
          left: "15%",
          width: 30,
          height: 30,
          border: "2px solid var(--iris-a3)",
          borderRadius: "50%",
          zIndex: 0,
          opacity: 0.3,
        }}
      />

      {/* ─── Content ──────────────────────────────────────── */}
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
              <Text
                size="2"
                weight="medium"
                style={{ color: "var(--accent-11)" }}
              >
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
              <Text
                size="2"
                weight="medium"
                style={{ color: "var(--accent-11)" }}
              >
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
