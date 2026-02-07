"use client";

import { useRouter } from "next/navigation";
import {
  Section,
  Container,
  Flex,
  Grid,
  Heading,
  Card,
  Button,
  Badge,
  Separator,
  Spinner,
} from "@radix-ui/themes";
import { Settings, Shield, LogIn } from "lucide-react";
import { Text } from "@radix-ui/themes";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/store/authStore";
import { StatsCard } from "@/components/admin/StatsCard";
import { HealthCard } from "@/components/admin/HealthCard";
import {
  PopulatePopularCard,
  PopulateRecentCard,
  PopulateCompleteCard,
  UpdateCoversCard,
} from "@/components/admin/ActionCard";
import { SliderManagerCard } from "@/components/admin/SliderManagerCard";
import { SearchAndSaveCard } from "@/components/admin/SearchAndSaveCard";

export default function AdminPage() {
  const { t } = useLocale();
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");
  const isAuthenticated = useAuthStore(
    (s) => s.user !== null && s.accessToken !== null
  );
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <Section size="3">
        <Container size="4" px="4">
          <Flex justify="center" align="center" py="9">
            <Spinner size="3" />
          </Flex>
        </Container>
      </Section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Section size="3">
        <Container size="1" px="4">
          <Card size="4">
            <Flex direction="column" align="center" gap="4" py="4">
              <LogIn size={48} style={{ color: "var(--accent-9)" }} />
              <Heading size="4" align="center">
                {t("auth.login_required")}
              </Heading>
              <Text size="2" color="gray" align="center">
                {t("auth.login_required_desc")}
              </Text>
              <Button size="3" onClick={() => router.push("/login")}>
                <LogIn size={16} />
                {t("auth.login")}
              </Button>
            </Flex>
          </Card>
        </Container>
      </Section>
    );
  }

  if (!isAdmin) {
    return (
      <Section size="3">
        <Container size="1" px="4">
          <Card size="4">
            <Flex direction="column" align="center" gap="4" py="4">
              <Shield size={48} style={{ color: "var(--red-9)" }} />
              <Heading size="4" align="center" color="red">
                {t("auth.access_denied")}
              </Heading>
              <Text size="2" color="gray" align="center">
                {t("auth.access_denied_desc")}
              </Text>
              <Button
                variant="soft"
                size="3"
                onClick={() => router.push("/")}
              >
                {t("nav.home")}
              </Button>
            </Flex>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section size="2">
      <Container size="4" px="4">
        <Flex direction="column" gap="6">
          <Flex align="center" gap="2">
            <Settings size={24} style={{ color: "var(--accent-9)" }} />
            <Heading size="6">{t("admin.title")}</Heading>
            <Badge variant="soft" color="amber" size="2">
              <Shield size={12} />
              {t("auth.admin_badge")}
            </Badge>
          </Flex>

          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <StatsCard />
            <HealthCard />
          </Grid>

          <Separator size="4" />

          <Heading size="4">{t("admin.actions_title")}</Heading>

          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <PopulatePopularCard />
            <PopulateRecentCard />
            <PopulateCompleteCard />
            <UpdateCoversCard />
          </Grid>

          <Separator size="4" />

          <SliderManagerCard />

          <Separator size="4" />

          <SearchAndSaveCard />
        </Flex>
      </Container>
    </Section>
  );
}
