package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Language;
import com.reader_hub.domain.model.Manga;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AuthorResponseDto - Testes de Conversão")
class AuthorResponseDtoTest {

    @Test
    @DisplayName("deve converter entity para DTO corretamente")
    void shouldConvertEntityToDto() {
        Author author = createAuthor();

        AuthorResponseDto dto = AuthorResponseDto.fromEntity(author);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo("author-1");
        assertThat(dto.getApiId()).isEqualTo("api-author-1");
        assertThat(dto.getName()).isEqualTo("Mangaká");
    }

    @Test
    @DisplayName("deve retornar null para entity null")
    void shouldReturnNullForNullEntity() {
        assertThat(AuthorResponseDto.fromEntity(null)).isNull();
    }

    @Test
    @DisplayName("deve contar mangás quando presente")
    void shouldCountMangasWhenPresent() {
        Author author = createAuthor();
        Manga m1 = new Manga();
        m1.setId("m1");
        Manga m2 = new Manga();
        m2.setId("m2");
        author.setMangas(List.of(m1, m2));

        AuthorResponseDto dto = AuthorResponseDto.fromEntity(author);

        assertThat(dto.getTotalMangas()).isEqualTo(2);
    }

    @Test
    @DisplayName("deve retornar 0 mangás quando lista é null")
    void shouldReturnZeroMangasWhenNull() {
        Author author = createAuthor();
        author.setMangas(null);

        AuthorResponseDto dto = AuthorResponseDto.fromEntity(author);

        assertThat(dto.getTotalMangas()).isEqualTo(0);
    }

    @Test
    @DisplayName("deve converter lista de autores")
    void shouldConvertEntityList() {
        Author a1 = createAuthor();
        Author a2 = new Author();
        a2.setId("author-2");
        a2.setName("Outro Autor");
        a2.setApiId("api-2");

        List<AuthorResponseDto> dtos = AuthorResponseDto.fromEntityList(List.of(a1, a2));

        assertThat(dtos).hasSize(2);
        assertThat(dtos.get(0).getName()).isEqualTo("Mangaká");
        assertThat(dtos.get(1).getName()).isEqualTo("Outro Autor");
    }

    private Author createAuthor() {
        Author author = new Author();
        author.setId("author-1");
        author.setApiId("api-author-1");
        author.setName("Mangaká");
        Language bio = new Language();
        bio.setEn("English bio");
        bio.setPt_BR("Bio em português");
        author.setBiography(bio);
        author.setCreatedAt(OffsetDateTime.now());
        author.setUpdatedAt(OffsetDateTime.now());
        return author;
    }
}
