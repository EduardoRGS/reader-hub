import { useReaderStore } from "@/store/readerStore";
import { t, type Locale } from "@/lib/i18n";

/**
 * Hook para acessar o idioma atual e a função de tradução.
 *
 * Uso:
 * ```tsx
 * const { locale, t } = useLocale();
 * <Text>{t("nav.home")}</Text>
 * <Text>{t("manga.votes", { count: 150 })}</Text>
 * ```
 */
export function useLocale() {
  const locale = useReaderStore((s) => s.locale);

  const translate = (
    key: string,
    vars?: Record<string, string | number>
  ): string => t(locale, key, vars);

  return { locale, t: translate };
}

export type { Locale };
