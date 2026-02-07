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
import { UserPlus, Mail, Lock, User, AlertCircle, BookOpen } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { authService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const { t } = useLocale();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.user !== null && s.accessToken !== null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações locais
    if (name.trim().length < 2) {
      setError(t("auth.name_min"));
      return;
    }
    if (password.length < 8 || password.length > 32) {
      setError(t("auth.password_length"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.password_mismatch"));
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.register({ name: name.trim(), email, password });
      setAuth(data.user, data.access_token);
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("já está em uso") || err.message.includes("already")) {
          setError(t("auth.email_in_use"));
        } else {
          setError(err.message);
        }
      } else {
        setError(t("auth.register_error"));
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
              {t("auth.register_title")}
            </Heading>
            <Text size="2" color="gray" align="center">
              {t("auth.register_subtitle")}
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
                    {t("auth.name")}
                  </Text>
                  <TextField.Root
                    size="3"
                    type="text"
                    placeholder={t("auth.name_placeholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                  >
                    <TextField.Slot>
                      <User size={16} style={{ color: "var(--gray-9)" }} />
                    </TextField.Slot>
                  </TextField.Root>
                </Flex>

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
                  <Text size="1" color="gray">
                    {t("auth.password_length")}
                  </Text>
                </Flex>

                <Flex direction="column" gap="1">
                  <Text size="2" weight="medium">
                    {t("auth.confirm_password")}
                  </Text>
                  <TextField.Root
                    size="3"
                    type="password"
                    placeholder={t("auth.confirm_password_placeholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <UserPlus size={16} />
                  )}
                  {isLoading ? t("general.loading") : t("auth.register")}
                </Button>

                <Flex justify="center" gap="1">
                  <Text size="2" color="gray">
                    {t("auth.has_account")}
                  </Text>
                  <Link
                    href="/login"
                    style={{
                      color: "var(--accent-11)",
                      textDecoration: "none",
                      fontWeight: 500,
                      fontSize: "var(--font-size-2)",
                    }}
                  >
                    {t("auth.login")}
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
