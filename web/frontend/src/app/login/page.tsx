"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Section,
  Container,
  Flex,
  Heading,
  Text,
  Card,
  Button,
  TextField,
  Callout,
  Box,
  Spinner,
} from "@radix-ui/themes";
import { LogIn, Mail, Lock, AlertCircle, BookOpen } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { authService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.user !== null && s.accessToken !== null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await authService.login({ email, password });
      setAuth(data.user, data.access_token);
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("auth.login_error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section size="3">
      <Container size="1" px="4">
        <Flex direction="column" align="center" gap="6">
          {/* Logo */}
          <Flex direction="column" align="center" gap="3">
            <Box
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background:
                  "linear-gradient(135deg, var(--accent-9), var(--accent-10))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <BookOpen size={28} strokeWidth={2} />
            </Box>
            <Heading size="6" align="center">
              {t("auth.login_title")}
            </Heading>
            <Text size="2" color="gray" align="center">
              {t("auth.login_subtitle")}
            </Text>
          </Flex>

          {/* Form */}
          <Card size="4" style={{ width: "100%", maxWidth: 400 }}>
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                {error && (
                  <Callout.Root color="red" size="1">
                    <Callout.Icon>
                      <AlertCircle size={14} />
                    </Callout.Icon>
                    <Callout.Text>{error}</Callout.Text>
                  </Callout.Root>
                )}

                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">
                    {t("auth.email")}
                  </Text>
                  <TextField.Root
                    size="3"
                    type="email"
                    placeholder={t("auth.email_placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  >
                    <TextField.Slot>
                      <Mail size={16} style={{ color: "var(--gray-9)" }} />
                    </TextField.Slot>
                  </TextField.Root>
                </Flex>

                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">
                    {t("auth.password")}
                  </Text>
                  <TextField.Root
                    size="3"
                    type="password"
                    placeholder={t("auth.password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={32}
                  >
                    <TextField.Slot>
                      <Lock size={16} style={{ color: "var(--gray-9)" }} />
                    </TextField.Slot>
                  </TextField.Root>
                </Flex>

                <Button
                  type="submit"
                  size="3"
                  disabled={isLoading}
                  style={{ cursor: isLoading ? "wait" : "pointer" }}
                >
                  {isLoading ? (
                    <Spinner size="1" />
                  ) : (
                    <LogIn size={16} />
                  )}
                  {isLoading ? t("general.loading") : t("auth.login")}
                </Button>

                <Flex justify="center" gap="1">
                  <Text size="2" color="gray">
                    {t("auth.no_account")}
                  </Text>
                  <Link
                    href="/register"
                    style={{
                      color: "var(--accent-11)",
                      textDecoration: "none",
                      fontWeight: 500,
                      fontSize: "var(--font-size-2)",
                    }}
                  >
                    {t("auth.register")}
                  </Link>
                </Flex>
              </Flex>
            </form>
          </Card>
        </Flex>
      </Container>
    </Section>
  );
}
