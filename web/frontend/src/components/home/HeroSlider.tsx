"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flex,
  Text,
  Button,
  Box,
  Container,
  Badge,
} from "@radix-ui/themes";
import { BookOpen, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useReaderStore, type SliderManga } from "@/store/readerStore";
import { useLocale } from "@/hooks/useLocale";
import { formatRating, proxyCoverUrl, COVER_BLUR_DATA_URL } from "@/lib/utils";
import { StarField } from "@/components/home/StarField";
import type { Locale } from "@/lib/i18n";

const AUTO_PLAY_MS = 6000;

function getSliderTitle(manga: SliderManga, locale: Locale): string {
  const primary = locale === "pt-br" ? "pt-br" : "en";
  const fallback = locale === "pt-br" ? "en" : "pt-br";
  return (
    manga.title?.[primary] ||
    manga.title?.[fallback] ||
    Object.values(manga.title || {}).find(Boolean) ||
    ""
  );
}

function getSliderDescription(
  manga: SliderManga,
  locale: Locale
): string {
  const primary = locale === "pt-br" ? "pt-br" : "en";
  const fallback = locale === "pt-br" ? "en" : "pt-br";
  const desc =
    manga.description?.[primary] ||
    manga.description?.[fallback] ||
    Object.values(manga.description || {}).find(Boolean) ||
    "";
  if (desc.length > 160) return desc.slice(0, 157) + "...";
  return desc;
}

export function HeroSlider() {
  const sliderMangas = useReaderStore((s) => s.sliderMangas);
  const { locale, t } = useLocale();
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const total = sliderMangas.length;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || total === 0) return;
      setIsTransitioning(true);
      setCurrent(((index % total) + total) % total);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning, total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(interval);
  }, [next, total]);

  if (total === 0) return null;

  const manga = sliderMangas[current];
  const title = getSliderTitle(manga, locale);
  const description = getSliderDescription(manga, locale);

  return (
    <Box className="hero-slider" style={{ position: "relative", overflow: "hidden" }}>
      {/* Background image (blurred) */}
      <Box className="hero-slider__bg">
        {manga.coverImage ? (
          <Image
            src={proxyCoverUrl(manga.coverImage)!}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
            placeholder="blur"
            blurDataURL={COVER_BLUR_DATA_URL}
          />
        ) : (
          <Box
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, var(--accent-3), var(--accent-2), var(--gray-2))",
            }}
          />
        )}
      </Box>

      {/* Overlay gradients */}
      <Box className="hero-slider__overlay" />

      {/* ✨ Starfield - estrelas piscando sobre o fundo escuro do slider */}
      <StarField count={45} variant="over-dark" />

      {/* Content */}
      <Container
        size="4"
        px="4"
        style={{ position: "relative", zIndex: 2 }}
      >
        <Flex
          align="center"
          gap="6"
          py="8"
          style={{ minHeight: 420 }}
          direction={{ initial: "column", sm: "row" }}
        >
          {/* Cover */}
          <Box
            className="hero-slider__cover animate-scale-in"
            key={manga.id + "-cover"}
          >
            {manga.coverImage ? (
              <Image
                src={proxyCoverUrl(manga.coverImage)!}
                alt={title}
                fill
                sizes="(max-width: 640px) 180px, 240px"
                style={{ objectFit: "cover", borderRadius: 12 }}
                priority
                placeholder="blur"
                blurDataURL={COVER_BLUR_DATA_URL}
              />
            ) : (
              <Flex
                align="center"
                justify="center"
                style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--gray-a3)",
                  borderRadius: 12,
                }}
              >
                <BookOpen size={48} style={{ color: "var(--gray-8)" }} />
              </Flex>
            )}
          </Box>

          {/* Info */}
          <Flex
            direction="column"
            gap="4"
            style={{ flex: 1, minWidth: 0, maxWidth: 560 }}
            className="animate-slide-up"
            key={manga.id + "-info"}
          >
            {/* Badge row */}
            <Flex gap="2" wrap="wrap">
              {manga.status && (
                <Badge
                  size="2"
                  variant="solid"
                  color={
                    manga.status === "ongoing"
                      ? "green"
                      : manga.status === "completed"
                      ? "blue"
                      : "gray"
                  }
                >
                  {t(`status.${manga.status}`)}
                </Badge>
              )}
              {manga.rating != null && manga.rating > 0 && (
                <Badge size="2" variant="soft" color="amber">
                  <Star size={12} />
                  {formatRating(manga.rating)}
                </Badge>
              )}
            </Flex>

            {/* Title */}
            <Text
              size="8"
              weight="bold"
              style={{
                color: "white",
                lineHeight: 1.1,
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </Text>

            {/* Author */}
            {manga.author && (
              <Text size="3" style={{ color: "rgba(255,255,255,0.7)" }}>
                {manga.author}
              </Text>
            )}

            {/* Description */}
            {description && (
              <Text
                size="3"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.6,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </Text>
            )}

            {/* CTA */}
            <Flex gap="3" mt="2">
              <Link href={`/manga/${manga.id}`}>
                <Button
                  size="3"
                  variant="solid"
                  style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    boxShadow: "0 4px 20px -4px rgba(0,0,0,0.4)",
                  }}
                >
                  <BookOpen size={16} />
                  {t("slider.read_now")}
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Container>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            className="hero-slider__arrow hero-slider__arrow--left"
            onClick={prev}
            aria-label={t("slider.prev")}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="hero-slider__arrow hero-slider__arrow--right"
            onClick={next}
            aria-label={t("slider.next")}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <Flex
          justify="center"
          gap="2"
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            zIndex: 3,
          }}
        >
          {sliderMangas.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`hero-slider__dot ${
                i === current ? "hero-slider__dot--active" : ""
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </Flex>
      )}
    </Box>
  );
}
