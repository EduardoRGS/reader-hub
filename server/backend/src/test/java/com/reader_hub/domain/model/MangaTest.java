package com.reader_hub.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Manga - Testes do Modelo")
class MangaTest {

    private Manga manga;

    @BeforeEach
    void setUp() {
        manga = new Manga();
        manga.setId("manga-1");
        manga.setApiId("api-1");
        manga.setTitle(Map.of(
                "pt-br", "Solo Leveling",
                "en", "Solo Leveling EN",
                "ja", "俺だけレベルアップな件"
        ));
        manga.setDescription(Map.of(
                "pt-br", "Descrição em português",
                "en", "English description"
        ));
        manga.setStatus("ongoing");
    }

    @Nested
    @DisplayName("getPreferredTitle")
    class GetPreferredTitle {

        @Test
        @DisplayName("deve retornar título no idioma preferido")
        void shouldReturnTitleInPreferredLanguage() {
            assertThat(manga.getPreferredTitle("pt-br")).isEqualTo("Solo Leveling");
        }

        @Test
        @DisplayName("deve retornar título em pt-br como fallback")
        void shouldFallbackToPtBr() {
            assertThat(manga.getPreferredTitle("ko")).isEqualTo("Solo Leveling");
        }

        @Test
        @DisplayName("deve retornar título em inglês quando pt-br não disponível")
        void shouldFallbackToEnglish() {
            manga.setTitle(Map.of("en", "English Only", "ja", "日本語"));
            assertThat(manga.getPreferredTitle("ko")).isEqualTo("English Only");
        }

        @Test
        @DisplayName("deve retornar qualquer título quando nenhum idioma preferido encontrado")
        void shouldReturnAnyTitleWhenNoPreferredFound() {
            manga.setTitle(Map.of("ja", "日本語のみ"));
            String result = manga.getPreferredTitle("ko");
            assertThat(result).isEqualTo("日本語のみ");
        }

        @Test
        @DisplayName("deve retornar mensagem padrão quando sem títulos")
        void shouldReturnDefaultMessageWhenNoTitles() {
            manga.setTitle(null);
            assertThat(manga.getPreferredTitle("pt-br")).isEqualTo("Título não disponível");
        }

        @Test
        @DisplayName("deve retornar mensagem padrão quando mapa de títulos vazio")
        void shouldReturnDefaultMessageWhenEmptyMap() {
            manga.setTitle(Map.of());
            assertThat(manga.getPreferredTitle("pt-br")).isEqualTo("Título não disponível");
        }
    }

    @Nested
    @DisplayName("getPreferredDescription")
    class GetPreferredDescription {

        @Test
        @DisplayName("deve retornar descrição no idioma preferido")
        void shouldReturnDescriptionInPreferredLanguage() {
            assertThat(manga.getPreferredDescription("en")).isEqualTo("English description");
        }

        @Test
        @DisplayName("deve retornar null quando sem descrições")
        void shouldReturnNullWhenNoDescriptions() {
            manga.setDescription(null);
            assertThat(manga.getPreferredDescription("pt-br")).isNull();
        }

        @Test
        @DisplayName("deve retornar null quando mapa de descrições vazio")
        void shouldReturnNullWhenEmptyDescriptions() {
            manga.setDescription(Map.of());
            assertThat(manga.getPreferredDescription("pt-br")).isNull();
        }
    }

    @Nested
    @DisplayName("hasTitleInLanguage")
    class HasTitleInLanguage {

        @Test
        @DisplayName("deve retornar true quando idioma existe")
        void shouldReturnTrueWhenLanguageExists() {
            assertThat(manga.hasTitleInLanguage("pt-br")).isTrue();
        }

        @Test
        @DisplayName("deve retornar false quando idioma não existe")
        void shouldReturnFalseWhenLanguageNotExists() {
            assertThat(manga.hasTitleInLanguage("ko")).isFalse();
        }

        @Test
        @DisplayName("deve retornar false quando título é null")
        void shouldReturnFalseWhenTitleIsNull() {
            manga.setTitle(null);
            assertThat(manga.hasTitleInLanguage("pt-br")).isFalse();
        }
    }

    @Nested
    @DisplayName("equals e hashCode")
    class EqualsAndHashCode {

        @Test
        @DisplayName("deve ser igual ao mesmo objeto")
        void shouldBeEqualToSelf() {
            assertThat(manga).isEqualTo(manga);
        }

        @Test
        @DisplayName("deve ser igual quando IDs são iguais")
        void shouldBeEqualWhenIdsAreEqual() {
            Manga other = new Manga();
            other.setId("manga-1");
            assertThat(manga).isEqualTo(other);
        }

        @Test
        @DisplayName("não deve ser igual quando IDs são diferentes")
        void shouldNotBeEqualWhenIdsAreDifferent() {
            Manga other = new Manga();
            other.setId("manga-2");
            assertThat(manga).isNotEqualTo(other);
        }

        @Test
        @DisplayName("não deve ser igual a null")
        void shouldNotBeEqualToNull() {
            assertThat(manga).isNotEqualTo(null);
        }

        @Test
        @DisplayName("não deve ser igual a outro tipo")
        void shouldNotBeEqualToOtherType() {
            assertThat(manga).isNotEqualTo("string");
        }

        @Test
        @DisplayName("hashCode deve ser consistente")
        void hashCodeShouldBeConsistent() {
            Manga other = new Manga();
            other.setId("manga-1");
            assertThat(manga.hashCode()).isEqualTo(other.hashCode());
        }
    }

    @Nested
    @DisplayName("@PrePersist (onCreate)")
    class OnCreate {

        @Test
        @DisplayName("deve inicializar campos nulos com valores padrão")
        void shouldInitializeNullFieldsWithDefaults() {
            Manga newManga = new Manga();
            newManga.onCreate();

            assertThat(newManga.getCreatedAt()).isNotNull();
            assertThat(newManga.getUpdatedAt()).isNotNull();
            assertThat(newManga.getViews()).isEqualTo(0);
            assertThat(newManga.getFollows()).isEqualTo(0);
            assertThat(newManga.getRating()).isEqualTo(0.0);
            assertThat(newManga.getRatingCount()).isEqualTo(0);
        }

        @Test
        @DisplayName("não deve sobrescrever campos já definidos")
        void shouldNotOverwriteExistingFields() {
            manga.setViews(100);
            manga.setFollows(50);
            manga.setRating(8.5);
            manga.setRatingCount(200);
            manga.onCreate();

            assertThat(manga.getViews()).isEqualTo(100);
            assertThat(manga.getFollows()).isEqualTo(50);
            assertThat(manga.getRating()).isEqualTo(8.5);
            assertThat(manga.getRatingCount()).isEqualTo(200);
        }
    }
}
