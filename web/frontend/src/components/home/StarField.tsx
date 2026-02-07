"use client";

import { useState, useEffect } from "react";

// ─── Star types ──────────────────────────────────────────

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: "normal" | "bright" | "cross";
  color: string;
}

const STAR_COLORS_LIGHT = [
  "var(--accent-9)",
  "var(--accent-8)",
  "var(--accent-7)",
  "var(--iris-9)",
  "var(--iris-8)",
  "var(--blue-9)",
  "var(--violet-8)",
  "rgba(255,255,255,0.9)",
  "rgba(255,255,255,0.7)",
  "rgba(255,255,255,0.5)",
];

const STAR_COLORS_OVER_DARK = [
  "rgba(255,255,255,0.95)",
  "rgba(255,255,255,0.8)",
  "rgba(255,255,255,0.65)",
  "rgba(200,210,255,0.9)",
  "rgba(180,190,255,0.8)",
  "rgba(220,200,255,0.7)",
  "rgba(255,220,180,0.6)",
  "var(--accent-9)",
  "var(--iris-9)",
  "var(--blue-9)",
];

function generateStars(count: number, palette: string[]): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const rand = Math.random;
    const type: Star["type"] =
      rand() < 0.08 ? "cross" : rand() < 0.25 ? "bright" : "normal";

    return {
      id: i,
      x: rand() * 96 + 2,
      y: rand() * 92 + 4,
      size:
        type === "cross"
          ? rand() * 5 + 6
          : type === "bright"
          ? rand() * 2 + 2.5
          : rand() * 2 + 1,
      delay: rand() * 8,
      duration:
        type === "cross"
          ? rand() * 3 + 4
          : rand() * 3 + 2,
      type,
      color: palette[Math.floor(rand() * palette.length)],
    };
  });
}

// ─── StarField Component ─────────────────────────────────

interface StarFieldProps {
  /** Número de estrelas (padrão: 55) */
  count?: number;
  /**
   * "auto" usa cores accent/iris para fundos claros
   * "over-dark" usa cores mais claras/brancas para fundos escuros (slider)
   */
  variant?: "auto" | "over-dark";
}

export function StarField({ count = 55, variant = "auto" }: StarFieldProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const palette =
      variant === "over-dark" ? STAR_COLORS_OVER_DARK : STAR_COLORS_LIGHT;
    setStars(generateStars(count, palette));
  }, [count, variant]);

  if (stars.length === 0) return null;

  return (
    <div className="starfield">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${
            star.type === "bright"
              ? "star--bright"
              : star.type === "cross"
              ? "star--cross"
              : ""
          }`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: star.color,
            color: star.color,
            ["--star-delay" as string]: `${star.delay}s`,
            ["--star-duration" as string]: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
