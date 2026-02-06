"use client";

import { useTheme } from "next-themes";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <IconButton variant="ghost" size="2" color="gray">
        <Sun size={18} />
      </IconButton>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip content={isDark ? t("theme.light") : t("theme.dark")}>
      <IconButton
        variant="ghost"
        size="2"
        color="gray"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? t("theme.light") : t("theme.dark")}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </IconButton>
    </Tooltip>
  );
}
