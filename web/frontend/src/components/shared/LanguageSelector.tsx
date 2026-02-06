"use client";

import { Select } from "@radix-ui/themes";
import { useReaderStore } from "@/store/readerStore";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, t } = useLocale();
  const setLocale = useReaderStore((s) => s.setLocale);

  return (
    <Select.Root
      value={locale}
      onValueChange={(v) => setLocale(v as Locale)}
      size="1"
    >
      <Select.Trigger
        variant="ghost"
        style={{ minWidth: 90 }}
        aria-label={t("language.label")}
      />
      <Select.Content>
        <Select.Item value="pt-br">{t("language.pt-br")}</Select.Item>
        <Select.Item value="en">{t("language.en")}</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}
