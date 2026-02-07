"use client";

import { useCallback } from "react";
import {
  Flex,
  Text,
  Card,
  Badge,
  Separator,
  TextField,
  ScrollArea,
  IconButton,
  Spinner,
} from "@radix-ui/themes";
import {
  SlidersHorizontal,
  Search,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { useReaderStore, type SliderManga } from "@/store/readerStore";
import { useLocale } from "@/hooks/useLocale";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { mangaService } from "@/services/api";
import { getTitle } from "@/lib/utils";
import { MiniCover } from "@/components/shared/MiniCover";
import type { Manga } from "@/types/manga";

export function SliderManagerCard() {
  const { locale, t } = useLocale();
  const sliderMangas = useReaderStore((s) => s.sliderMangas);
  const addSliderManga = useReaderStore((s) => s.addSliderManga);
  const removeSliderManga = useReaderStore((s) => s.removeSliderManga);
  const reorderSliderMangas = useReaderStore((s) => s.reorderSliderMangas);

  // Busca com debounce reutilizável
  const search = useDebouncedSearch<Manga>(
    useCallback(async (q: string, signal: AbortSignal) => {
      const data = await mangaService.searchMangas(q, 8, 0, undefined, signal);
      return data.content;
    }, []),
    { debounceMs: 300 }
  );

  const handleAdd = (manga: Manga) => {
    const item: SliderManga = {
      id: manga.id,
      title: manga.title,
      description: manga.description as Record<string, string | undefined>,
      coverImage: manga.coverImage,
      author: manga.author?.name,
      rating: manga.rating,
      status: manga.status,
    };
    addSliderManga(item);
    search.clear();
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const arr = [...sliderMangas];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorderSliderMangas(arr);
  };

  const moveDown = (index: number) => {
    if (index >= sliderMangas.length - 1) return;
    const arr = [...sliderMangas];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    reorderSliderMangas(arr);
  };

  const isInSlider = (id: string) => sliderMangas.some((m) => m.id === id);

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <SlidersHorizontal
            size={18}
            style={{ color: "var(--accent-9)" }}
          />
          <Text size="3" weight="bold">
            {t("admin.slider_title")}
          </Text>
          <Badge variant="soft" size="1">
            {sliderMangas.length}
          </Badge>
        </Flex>
        <Text size="2" color="gray">
          {t("admin.slider_desc")}
        </Text>

        {/* Itens atuais do slider */}
        {sliderMangas.length > 0 && (
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {t("admin.slider_current")}
            </Text>
            {sliderMangas.map((manga, index) => {
              const title =
                manga.title?.[locale === "pt-br" ? "pt-br" : "en"] ||
                manga.title?.["en"] ||
                Object.values(manga.title || {}).find(Boolean) ||
                "";
              return (
                <Card key={manga.id} size="1" variant="surface">
                  <Flex align="center" gap="3">
                    <MiniCover
                      src={manga.coverImage}
                      alt={title}
                      width={40}
                      height={56}
                    />

                    <Flex
                      direction="column"
                      gap="0"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <Text size="2" weight="medium" truncate>
                        {title}
                      </Text>
                      <Text size="1" color="gray">
                        {t("admin.slider_position", { pos: index + 1 })}
                      </Text>
                    </Flex>

                    <Flex gap="1">
                      <IconButton
                        variant="ghost"
                        color="gray"
                        size="1"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp size={14} />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        color="gray"
                        size="1"
                        onClick={() => moveDown(index)}
                        disabled={index === sliderMangas.length - 1}
                      >
                        <ChevronDown size={14} />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        color="red"
                        size="1"
                        onClick={() => removeSliderManga(manga.id)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Flex>
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        )}

        {sliderMangas.length === 0 && (
          <Flex
            direction="column"
            align="center"
            gap="2"
            py="4"
            style={{
              border: "2px dashed var(--gray-a5)",
              borderRadius: "var(--radius-3)",
            }}
          >
            <SlidersHorizontal size={28} style={{ color: "var(--gray-8)" }} />
            <Text size="2" color="gray">
              {t("admin.slider_empty")}
            </Text>
          </Flex>
        )}

        {/* Busca para adicionar */}
        <Separator size="4" />
        <Text size="2" weight="medium">
          {t("admin.slider_add")}
        </Text>

        <TextField.Root
          placeholder={t("admin.slider_search_placeholder")}
          size="2"
          value={search.searchValue}
          onChange={(e) => search.setSearchValue(e.target.value)}
        >
          <TextField.Slot>
            <Search size={14} />
          </TextField.Slot>
          {search.isSearching && (
            <TextField.Slot>
              <Spinner size="1" />
            </TextField.Slot>
          )}
        </TextField.Root>

        {/* Resultados da busca */}
        {search.results.length > 0 && (
          <ScrollArea style={{ maxHeight: 320 }}>
            <Flex direction="column" gap="2">
              {search.results.map((manga) => {
                const title = getTitle(manga, locale);
                const alreadyAdded = isInSlider(manga.id);
                return (
                  <Card key={manga.id} size="1" variant="surface">
                    <Flex align="center" gap="3">
                      <MiniCover src={manga.coverImage} alt={title} />

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

                      {alreadyAdded ? (
                        <Badge variant="soft" color="green" size="1">
                          <CheckCircle size={10} />
                          {t("admin.slider_added")}
                        </Badge>
                      ) : (
                        <IconButton
                          variant="soft"
                          size="1"
                          onClick={() => handleAdd(manga)}
                        >
                          <Plus size={14} />
                        </IconButton>
                      )}
                    </Flex>
                  </Card>
                );
              })}
            </Flex>
          </ScrollArea>
        )}
      </Flex>
    </Card>
  );
}
