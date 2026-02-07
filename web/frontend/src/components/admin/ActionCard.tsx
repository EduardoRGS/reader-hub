"use client";

import { useState, useEffect, useRef } from "react";
import {
  Flex,
  Text,
  Card,
  Button,
  Callout,
  Spinner,
  Box,
} from "@radix-ui/themes";
import {
  Download,
  Zap,
  Database,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  usePopulatePopular,
  usePopulateRecent,
  usePopulateComplete,
  useUpdateCovers,
} from "@/hooks/queries";
import { useLocale } from "@/hooks/useLocale";

// ─── Simulated Progress Hook ─────────────────────────────
//
// Como as APIs de população retornam tudo de uma vez (sem streaming),
// usamos um progresso estimado com curva exponencial que:
// - Sobe rápido no início (feedback instantâneo)
// - Desacelera perto de 90% (nunca chega a 100% sozinho)
// - Pula para 100% quando a operação termina
// - Reseta após exibir o resultado

function useSimulatedProgress(
  isPending: boolean,
  estimatedMs: number
): { progress: number; elapsed: number } {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const completedRef = useRef(false);

  useEffect(() => {
    if (isPending) {
      startRef.current = Date.now();
      completedRef.current = false;

      const tick = () => {
        if (!startRef.current) return;
        const ms = Date.now() - startRef.current;
        setElapsed(ms);

        // Curva exponencial: sobe rápido no início, desacelera ao se aproximar de 90%
        const p = 92 * (1 - Math.exp((-3 * ms) / estimatedMs));
        setProgress(Math.min(Math.round(p), 92));

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } else if (!completedRef.current && startRef.current !== null) {
      // Operação concluiu — pular para 100%
      completedRef.current = true;
      setProgress(100);

      const timer = setTimeout(() => {
        setProgress(0);
        setElapsed(0);
        startRef.current = null;
      }, 3000);

      return () => clearTimeout(timer);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPending, estimatedMs]);

  return { progress, elapsed };
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return "<1s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

// ─── Generic Action Card ─────────────────────────────────

interface ActionCardProps {
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  titleKey: string;
  descKey: string;
  buttonKey: string;
  onAction: () => void;
  isPending: boolean;
  result?: { status?: string; message?: string } | null;
  color?: "iris" | "cyan" | "green" | "orange";
  /** Tempo estimado da operação em ms (para a barra de progresso) */
  estimatedMs?: number;
}

function ActionCard({
  icon: Icon,
  titleKey,
  descKey,
  buttonKey,
  onAction,
  isPending,
  result,
  color = "iris",
  estimatedMs = 15000,
}: ActionCardProps) {
  const { t } = useLocale();
  const { progress, elapsed } = useSimulatedProgress(isPending, estimatedMs);
  const showProgress = progress > 0;

  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2">
          <Icon size={18} style={{ color: `var(--${color}-9)` }} />
          <Text size="2" weight="bold">
            {t(titleKey)}
          </Text>
        </Flex>
        <Text size="1" color="gray">
          {t(descKey)}
        </Text>

        <Button
          variant="soft"
          color={color}
          onClick={onAction}
          disabled={isPending}
        >
          {isPending ? <Spinner size="1" /> : <Icon size={14} style={{}} />}
          {isPending ? t("admin.processing") : t(buttonKey)}
        </Button>

        {/* Barra de progresso */}
        {showProgress && (
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between">
              <Flex align="center" gap="1">
                {progress < 100 ? (
                  <Spinner size="1" />
                ) : (
                  <CheckCircle
                    size={14}
                    style={{ color: "var(--green-9)" }}
                  />
                )}
                <Text
                  size="1"
                  weight="bold"
                  style={{
                    color:
                      progress >= 100
                        ? "var(--green-11)"
                        : `var(--${color}-11)`,
                  }}
                >
                  {progress}%
                </Text>
              </Flex>
              <Flex align="center" gap="1">
                <Clock size={10} style={{ color: "var(--gray-9)" }} />
                <Text size="1" color="gray">
                  {formatElapsed(elapsed)}
                </Text>
              </Flex>
            </Flex>

            <Box
              style={{
                position: "relative",
                height: 8,
                borderRadius: "var(--radius-2)",
                background: "var(--gray-a3)",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${progress}%`,
                  borderRadius: "var(--radius-2)",
                  background:
                    progress >= 100
                      ? "var(--green-9)"
                      : `var(--${color}-9)`,
                  transition:
                    progress >= 100
                      ? "width 0.3s ease, background 0.3s ease"
                      : "width 0.5s ease-out",
                }}
              />
              {/* Shimmer effect enquanto processando */}
              {progress < 100 && (
                <Box
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${progress}%`,
                    borderRadius: "var(--radius-2)",
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }}
                />
              )}
            </Box>

            {progress >= 100 && (
              <Text size="1" color="green" weight="medium">
                {t("admin.progress_complete")}
              </Text>
            )}
          </Flex>
        )}

        {/* Resultado */}
        {result && !isPending && progress === 0 && (
          <Callout.Root
            color={result.status === "success" ? "green" : "red"}
            size="1"
          >
            <Callout.Icon>
              {result.status === "success" ? (
                <CheckCircle size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
            </Callout.Icon>
            <Callout.Text>{result.message}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </Card>
  );
}

// ─── Concrete Action Cards ───────────────────────────────

export function PopulatePopularCard() {
  const m = usePopulatePopular();
  return (
    <ActionCard
      icon={Download}
      titleKey="admin.popular_title"
      descKey="admin.popular_desc"
      buttonKey="admin.popular_btn"
      onAction={() => m.mutate({ limit: 20, offset: 0 })}
      isPending={m.isPending}
      result={m.data}
      color="iris"
      estimatedMs={15000}
    />
  );
}

export function PopulateRecentCard() {
  const m = usePopulateRecent();
  return (
    <ActionCard
      icon={Zap}
      titleKey="admin.recent_title"
      descKey="admin.recent_desc"
      buttonKey="admin.recent_btn"
      onAction={() => m.mutate({ limit: 20, offset: 0 })}
      isPending={m.isPending}
      result={m.data}
      color="cyan"
      estimatedMs={15000}
    />
  );
}

export function PopulateCompleteCard() {
  const m = usePopulateComplete();
  return (
    <ActionCard
      icon={Database}
      titleKey="admin.complete_title"
      descKey="admin.complete_desc"
      buttonKey="admin.complete_btn"
      onAction={() =>
        m.mutate({ mangaLimit: 10, offset: 0, includeChapters: true })
      }
      isPending={m.isPending}
      result={m.data}
      color="green"
      estimatedMs={60000}
    />
  );
}

export function UpdateCoversCard() {
  const m = useUpdateCovers();
  return (
    <ActionCard
      icon={ImageIcon}
      titleKey="admin.covers_title"
      descKey="admin.covers_desc"
      buttonKey="admin.covers_btn"
      onAction={() => m.mutate()}
      isPending={m.isPending}
      result={
        m.data
          ? { status: "success", message: String(m.data) }
          : m.error
          ? { status: "error", message: m.error.message }
          : null
      }
      color="orange"
      estimatedMs={20000}
    />
  );
}
