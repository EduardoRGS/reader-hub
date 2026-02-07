"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Flex,
  Container,
  Text,
  Box,
  TextField,
  IconButton,
  Card,
  Spinner,
} from "@radix-ui/themes";
import {
  BookOpen,
  Library,
  Settings,
  Home,
  Search,
  X,
  ArrowRight,
  LogIn,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { useLocale } from "@/hooks/useLocale";
import { mangaService, authService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { getTitle } from "@/lib/utils";
import type { Manga } from "@/types/manga";

const DEBOUNCE_MS = 300;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t } = useLocale();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.user !== null && s.accessToken !== null);
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Links de navegação - Admin só aparece para admins
  const navKeys = [
    { href: "/", labelKey: "nav.home", icon: Home },
    { href: "/library", labelKey: "nav.library", icon: Library },
    ...(isAdmin
      ? [{ href: "/admin", labelKey: "nav.admin", icon: Settings }]
      : []),
  ];

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<Manga[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Live search com debounce ──────────────────────────
  useEffect(() => {
    const q = searchValue.trim();

    if (q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await mangaService.searchMangas(
          q,
          6,
          0,
          undefined,
          controller.signal
        );
        if (!controller.signal.aborted) {
          setResults(data.content);
          setShowDropdown(true);
          setIsSearching(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [searchValue]);

  // ─── Fechar dropdown ao clicar fora ────────────────────
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  // ─── Keyboard shortcuts ────────────────────────────────
  useEffect(() => {
    if (!searchOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchValue("");
        setShowDropdown(false);
        setResults([]);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" &&
          !["INPUT", "TEXTAREA"].includes(
            (e.target as HTMLElement).tagName
          ))
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // ─── Navigation ────────────────────────────────────────
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchValue("");
    setShowDropdown(false);
    setResults([]);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = searchValue.trim();
      if (q.length < 1) return;
      router.push(`/library?q=${encodeURIComponent(q)}`);
      closeSearch();
    },
    [searchValue, router, closeSearch]
  );

  const handleViewAll = useCallback(() => {
    const q = searchValue.trim();
    if (q.length < 1) return;
    router.push(`/library?q=${encodeURIComponent(q)}`);
    closeSearch();
  }, [searchValue, router, closeSearch]);

  const navigateToManga = useCallback(
    (id: string) => {
      router.push(`/manga/${id}`);
      closeSearch();
    },
    [router, closeSearch]
  );

  return (
    <header
      className="glass animate-slide-down"
      style={{
        borderBottom: "1px solid var(--gray-a4)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Container size="4" px="4">
        <Flex align="center" justify="between" style={{ height: 56 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, var(--accent-9), var(--accent-10))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                <BookOpen size={16} strokeWidth={2} />
              </Box>
              <Box display={{ initial: "none", sm: "block" }}>
                <Text
                  size="4"
                  weight="bold"
                  className="gradient-text"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {t("app.name")}
                </Text>
              </Box>
            </Flex>
          </Link>

          {/* Center: Search bar or nav pills */}
          {searchOpen ? (
            <div
              ref={containerRef}
              className="animate-scale-in"
              style={{
                flex: 1,
                maxWidth: 480,
                margin: "0 12px",
                position: "relative",
              }}
            >
              <form onSubmit={handleSubmit}>
                <TextField.Root
                  ref={inputRef}
                  size="2"
                  placeholder={t("nav.search_placeholder")}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => {
                    if (results.length > 0) setShowDropdown(true);
                  }}
                  style={{ width: "100%" }}
                >
                  <TextField.Slot>
                    {isSearching ? (
                      <Spinner size="1" />
                    ) : (
                      <Search
                        size={14}
                        style={{ color: "var(--accent-9)" }}
                      />
                    )}
                  </TextField.Slot>
                  <TextField.Slot>
                    <IconButton
                      type="button"
                      variant="ghost"
                      color="gray"
                      size="1"
                      onClick={closeSearch}
                    >
                      <X size={14} />
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </form>

              {/* Dropdown results */}
              {showDropdown && results.length > 0 && (
                <Card
                  size="1"
                  className="animate-slide-down"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    maxHeight: 400,
                    overflow: "auto",
                    boxShadow:
                      "0 12px 40px -8px rgba(0,0,0,0.2), 0 0 0 1px var(--gray-a4)",
                  }}
                >
                  <Flex direction="column" gap="0">
                    {results.map((manga) => {
                      const title = getTitle(manga, locale);
                      return (
                        <Box
                          key={manga.id}
                          onClick={() => navigateToManga(manga.id)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderRadius: "var(--radius-2)",
                            transition: "background 0.15s",
                          }}
                          className="hover:bg-[var(--gray-a3)]"
                        >
                          <Flex align="center" gap="3">
                            {/* Mini cover */}
                            <Box
                              style={{
                                width: 36,
                                height: 52,
                                borderRadius: "var(--radius-2)",
                                overflow: "hidden",
                                flexShrink: 0,
                                background: "var(--gray-a3)",
                                position: "relative",
                              }}
                            >
                              {manga.coverImage ? (
                                <Image
                                  src={manga.coverImage}
                                  alt={title}
                                  fill
                                  sizes="36px"
                                  style={{ objectFit: "cover" }}
                                  unoptimized
                                />
                              ) : (
                                <Flex
                                  align="center"
                                  justify="center"
                                  style={{ height: "100%" }}
                                >
                                  <BookOpen
                                    size={14}
                                    style={{ color: "var(--gray-7)" }}
                                  />
                                </Flex>
                              )}
                            </Box>

                            {/* Info */}
                            <Flex
                              direction="column"
                              gap="0"
                              style={{ flex: 1, minWidth: 0 }}
                            >
                              <Text size="2" weight="medium" truncate>
                                {title}
                              </Text>
                              <Text size="1" color="gray">
                                {manga.author?.name ?? manga.status}
                              </Text>
                            </Flex>

                            <ArrowRight
                              size={14}
                              style={{ color: "var(--gray-8)", flexShrink: 0 }}
                            />
                          </Flex>
                        </Box>
                      );
                    })}

                    {/* "Ver todos" link */}
                    <Box
                      onClick={handleViewAll}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderTop: "1px solid var(--gray-a4)",
                        transition: "background 0.15s",
                      }}
                      className="hover:bg-[var(--gray-a3)]"
                    >
                      <Flex align="center" justify="center" gap="2">
                        <Search size={13} style={{ color: "var(--accent-9)" }} />
                        <Text size="2" weight="medium" color="iris">
                          {t("nav.search_all", { query: searchValue.trim() })}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                </Card>
              )}

              {/* No results message */}
              {showDropdown &&
                results.length === 0 &&
                !isSearching &&
                searchValue.trim().length >= 2 && (
                  <Card
                    size="1"
                    className="animate-slide-down"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      zIndex: 100,
                      boxShadow:
                        "0 12px 40px -8px rgba(0,0,0,0.2), 0 0 0 1px var(--gray-a4)",
                    }}
                  >
                    <Flex
                      direction="column"
                      align="center"
                      gap="1"
                      py="3"
                    >
                      <Text size="2" color="gray">
                        {t("nav.search_no_results")}
                      </Text>
                    </Flex>
                  </Card>
                )}
            </div>
          ) : (
            <Flex
              align="center"
              gap="1"
              px="1"
              style={{
                background: "var(--gray-a3)",
                borderRadius: "var(--radius-4)",
                padding: "3px",
              }}
            >
              {navKeys.map(({ href, labelKey, icon: Icon }) => {
                const isActive =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{ textDecoration: "none" }}
                    aria-label={t(labelKey)}
                  >
                    <Flex
                      align="center"
                      gap="2"
                      px="3"
                      py="1"
                      style={{
                        borderRadius: "var(--radius-3)",
                        background: isActive
                          ? "var(--accent-a4)"
                          : "transparent",
                        color: isActive
                          ? "var(--accent-11)"
                          : "var(--gray-11)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        fontSize: "var(--font-size-2)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      <Icon size={15} />
                      <Box display={{ initial: "none", sm: "block" }}>
                        <Text size="2">{t(labelKey)}</Text>
                      </Box>
                    </Flex>
                  </Link>
                );
              })}
            </Flex>
          )}

          {/* Right controls */}
          <Flex align="center" gap="1" style={{ flexShrink: 0 }}>
            {!searchOpen && (
              <IconButton
                variant="ghost"
                color="gray"
                size="2"
                onClick={() => setSearchOpen(true)}
                aria-label={t("nav.search_placeholder")}
              >
                <Search size={16} />
              </IconButton>
            )}

            <Box
              style={{
                width: 1,
                height: 20,
                background: "var(--gray-a5)",
                margin: "0 4px",
              }}
            />

            <LanguageSelector />
            <ThemeToggle />

            <Box
              style={{
                width: 1,
                height: 20,
                background: "var(--gray-a5)",
                margin: "0 4px",
              }}
            />

            {/* Auth: Login/User Menu */}
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Flex align="center" gap="2">
                    <Box display={{ initial: "none", sm: "block" }}>
                    <Flex
                      align="center"
                      gap="1"
                    >
                      {isAdmin && (
                        <Box
                          style={{
                            background: "var(--amber-a3)",
                            color: "var(--amber-11)",
                            padding: "2px 6px",
                            borderRadius: "var(--radius-2)",
                            fontSize: "var(--font-size-1)",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Shield size={10} />
                          {t("auth.admin_badge")}
                        </Box>
                      )}
                      <Text size="2" color="gray" weight="medium">
                        {user?.name?.split(" ")[0]}
                      </Text>
                    </Flex>
                    </Box>
                    <IconButton
                      variant="ghost"
                      color="gray"
                      size="2"
                      onClick={async () => {
                        await authService.logout();
                        clearAuth();
                        router.push("/");
                      }}
                      aria-label={t("auth.logout")}
                      title={t("auth.logout")}
                    >
                      <LogOut size={16} />
                    </IconButton>
                  </Flex>
                ) : (
                  <Link href="/login" style={{ textDecoration: "none" }}>
                    <Flex
                      align="center"
                      gap="2"
                      px="3"
                      py="1"
                      style={{
                        borderRadius: "var(--radius-3)",
                        background: "var(--accent-a4)",
                        color: "var(--accent-11)",
                        cursor: "pointer",
                        fontSize: "var(--font-size-2)",
                        fontWeight: 500,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <LogIn size={14} />
                      <Box display={{ initial: "none", sm: "block" }}>
                        <Text size="2">{t("auth.login")}</Text>
                      </Box>
                    </Flex>
                  </Link>
                )}
              </>
            )}
          </Flex>
        </Flex>
      </Container>
    </header>
  );
}
