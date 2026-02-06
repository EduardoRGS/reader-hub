import type { Manga } from "@/types/manga";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

/**
 * Retorna o título do mangá no idioma preferido.
 * Prioridade: idioma selecionado → fallback → primeiro disponível.
 */
export function getTitle(manga: Manga, locale: Locale = "pt-br"): string {
  const primary = locale === "pt-br" ? "pt-br" : "en";
  const fallback = locale === "pt-br" ? "en" : "pt-br";

  return (
    manga.title?.[primary] ||
    manga.title?.[fallback] ||
    Object.values(manga.title || {}).find(Boolean) ||
    t(locale, "manga.no_title")
  );
}

/**
 * Retorna a descrição do mangá no idioma preferido.
 */
export function getDescription(manga: Manga, locale: Locale = "pt-br"): string {
  const primary = locale === "pt-br" ? "pt-br" : "en";
  const fallback = locale === "pt-br" ? "en" : "pt-br";

  return (
    manga.description?.[primary] ||
    manga.description?.[fallback] ||
    Object.values(manga.description || {}).find(Boolean) ||
    ""
  );
}

/**
 * Formata um número para exibição (1000 → 1K, 1000000 → 1M).
 */
export function formatNumber(num?: number): string {
  if (num == null) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Formata uma data ISO para exibição no idioma escolhido.
 */
export function formatDate(dateStr?: string, locale: Locale = "pt-br"): string {
  if (!dateStr) return "";
  try {
    const loc = locale === "pt-br" ? "pt-BR" : "en-US";
    return new Date(dateStr).toLocaleDateString(loc, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Formata o rating para exibição (ex: 8.52).
 */
export function formatRating(rating?: number): string {
  if (rating == null) return "N/A";
  return rating.toFixed(2);
}
