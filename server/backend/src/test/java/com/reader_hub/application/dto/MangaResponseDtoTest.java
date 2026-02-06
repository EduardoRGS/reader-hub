package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Chapter;
import com.reader_hub.domain.model.Manga;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MangaResponseDto - Testes de Conversão")
class MangaResponseDtoTest {

    @Test
    @DisplayName("deve converter entity para DTO corretamente")
    void shouldConvertEntityToDto() {
        Manga manga = createFullManga();

        MangaResponseDto dto = MangaResponseDto.fromEntity(manga);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo("manga-1");
        assertThat(dto.getApiId()).isEqualTo("api-1");
        assertThat(dto.getTitle()).containsEntry("pt-br", "Solo Leveling");
        assertThat(dto.getDescription()).containsEntry("en", "English description");
        assertThat(dto.getStatus()).isEqualTo("completed");
        assertThat(dto.getYear()).isEqualTo("2018");
        assertThat(dto.getViews()).isEqualTo(50000);
        assertThat(dto.getFollows()).isEqualTo(15000);
        assertThat(dto.getRating()).isEqualTo(9.2);
        assertThat(dto.getRatingCount()).isEqualTo(5000);
        assertThat(dto.getCoverImage()).isEqualTo("https://cover.jpg");
    }

    @Test
    @DisplayName("deve retornar null quando entity é null")
    void shouldReturnNullWhenEntityIsNull() {
        assertThat(MangaResponseDto.fromEntity(null)).isNull();
    }

    @Test
    @DisplayName("deve converter autor quando presente")
    void shouldConvertAuthorWhenPresent() {
        Manga manga = createFullManga();
        Author author = new Author();
        author.setId("author-1");
        author.setName("Mangaká Teste");
        author.setApiId("api-author-1");
        manga.setAuthor(author);

        MangaResponseDto dto = MangaResponseDto.fromEntity(manga);

        assertThat(dto.getAuthor()).isNotNull();
        assertThat(dto.getAuthor().getId()).isEqualTo("author-1");
        assertThat(dto.getAuthor().getName()).isEqualTo("Mangaká Teste");
    }

    @Test
    @DisplayName("deve ter autor null quando manga não tem autor")
    void shouldHaveNullAuthorWhenMangaHasNoAuthor() {
        Manga manga = createFullManga();
        manga.setAuthor(null);

        MangaResponseDto dto = MangaResponseDto.fromEntity(manga);

        assertThat(dto.getAuthor()).isNull();
    }

    @Test
    @DisplayName("deve contar capítulos quando presente")
    void shouldCountChaptersWhenPresent() {
        Manga manga = createFullManga();
        Chapter ch1 = new Chapter();
        ch1.setId("ch-1");
        ch1.setChapter("1");
        Chapter ch2 = new Chapter();
        ch2.setId("ch-2");
        ch2.setChapter("2");
        manga.setChapters(List.of(ch1, ch2));

        MangaResponseDto dto = MangaResponseDto.fromEntity(manga);

        assertThat(dto.getTotalChapters()).isEqualTo(2);
    }

    @Test
    @DisplayName("deve retornar 0 capítulos quando lista é null")
    void shouldReturnZeroChaptersWhenListIsNull() {
        Manga manga = createFullManga();
        manga.setChapters(null);

        MangaResponseDto dto = MangaResponseDto.fromEntity(manga);

        assertThat(dto.getTotalChapters()).isEqualTo(0);
    }

    private Manga createFullManga() {
        Manga manga = new Manga();
        manga.setId("manga-1");
        manga.setApiId("api-1");
        manga.setTitle(Map.of("pt-br", "Solo Leveling", "en", "Solo Leveling EN"));
        manga.setDescription(Map.of("pt-br", "Descrição", "en", "English description"));
        manga.setStatus("completed");
        manga.setYear("2018");
        manga.setCreatedAt(OffsetDateTime.now());
        manga.setUpdatedAt(OffsetDateTime.now());
        manga.setViews(50000);
        manga.setFollows(15000);
        manga.setRating(9.2);
        manga.setRatingCount(5000);
        manga.setCoverImage("https://cover.jpg");
        return manga;
    }
}
