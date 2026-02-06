import { Badge } from "@radix-ui/themes";
import type { MangaStatus } from "@/types/manga";
import { useLocale } from "@/hooks/useLocale";

const STATUS_COLORS: Record<MangaStatus, "green" | "blue" | "orange" | "red"> = {
  ongoing: "green",
  completed: "blue",
  hiatus: "orange",
  cancelled: "red",
};

interface StatusBadgeProps {
  status: MangaStatus;
  size?: "1" | "2" | "3";
}

export function StatusBadge({ status, size = "1" }: StatusBadgeProps) {
  const { t } = useLocale();

  return (
    <Badge color={STATUS_COLORS[status]} variant="soft" size={size}>
      {t(`status.${status}`)}
    </Badge>
  );
}
