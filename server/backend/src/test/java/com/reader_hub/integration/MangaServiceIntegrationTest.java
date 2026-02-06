package com.reader_hub.integration;

import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.service.MangaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes de integração para MangaService usando Testcontainers.
 * Requer Docker em execução. Desativado por padrão na CI sem Docker.
 * Para rodar localmente: export RUN_INTEGRATION_TESTS=true
 * 
 * Funcionalidades testadas:
 * - CRUD básico
 * - Busca multilíngue
 * - Performance de queries
 * - Integridade dos dados
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@Transactional
@EnabledIfEnvironmentVariable(named = "RUN_INTEGRATION_TESTS", matches = "true")
class MangaServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("readerhub_test")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("test-init.sql");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("app.cache.enabled", () -> "false"); // Desabilitar cache nos testes
    }

    @Autowired
    private MangaService mangaService;

    @Test
    void shouldSaveAndRetrieveManga() {
        // Given
        Manga manga = createTestManga();
        
        // When
        Manga savedManga = mangaService.save(manga);
        Optional<Manga> retrievedManga = mangaService.findById(savedManga.getId());
        
        // Then
        assertThat(retrievedManga).isPresent();
        assertThat(retrievedManga.get().getApiId()).isEqualTo("test-api-id");
        assertThat(retrievedManga.get().getTitle()).containsEntry("pt-br", "Teste Mangá");
        assertThat(retrievedManga.get().getStatus()).isEqualTo("ongoing");
    }

    @Test
    void shouldSearchByTitleMultilingual() {
        // Given
        Manga manga1 = createTestManga();
        manga1.setTitle(Map.of(
            "pt-br", "Solo Leveling",
            "en", "Solo Leveling",
            "ko", "나 혼자만 레벨업"
        ));
        
        Manga manga2 = createTestManga();
        manga2.setApiId("test-api-id-2");
        manga2.setTitle(Map.of(
            "pt-br", "Attack on Titan",
            "en", "Attack on Titan",
            "ja", "進撃の巨人"
        ));
        
        mangaService.save(manga1);
        mangaService.save(manga2);
        
        // When
        Page<Manga> results = mangaService.searchByTitle("Solo", "pt-br", PageRequest.of(0, 10));
        
        // Then
        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getPreferredTitle("pt-br")).contains("Solo Leveling");
    }

    @Test
    void shouldFindMangaWithAuthor() {
        // Given
        Manga manga = createTestManga();
        Manga savedManga = mangaService.save(manga);
        
        // When
        Optional<Manga> result = mangaService.findByIdWithAuthor(savedManga.getId());
        
        // Then
        assertThat(result).isPresent();
        // Note: Author seria null neste teste, mas em um cenário real seria carregado
    }

    @Test
    void shouldFindLatestMangas() {
        // Given
        Manga manga1 = createTestManga();
        manga1.setCreatedAt(OffsetDateTime.now().minusDays(1));
        
        Manga manga2 = createTestManga();
        manga2.setApiId("test-api-id-2");
        manga2.setCreatedAt(OffsetDateTime.now());
        
        mangaService.save(manga1);
        mangaService.save(manga2);
        
        // When
        Page<Manga> results = mangaService.findLatestMangas(PageRequest.of(0, 10));
        
        // Then
        assertThat(results.getContent()).hasSize(2);
        // O mais recente deve vir primeiro
        assertThat(results.getContent().get(0).getApiId()).isEqualTo("test-api-id-2");
    }

    @Test
    void shouldFindByStatus() {
        // Given
        Manga ongoingManga = createTestManga();
        ongoingManga.setStatus("ongoing");
        
        Manga completedManga = createTestManga();
        completedManga.setApiId("test-api-id-2");
        completedManga.setStatus("completed");
        
        mangaService.save(ongoingManga);
        mangaService.save(completedManga);
        
        // When
        Page<Manga> ongoingResults = mangaService.findByStatus("ongoing", PageRequest.of(0, 10));
        Page<Manga> completedResults = mangaService.findByStatus("completed", PageRequest.of(0, 10));
        
        // Then
        assertThat(ongoingResults.getContent()).hasSize(1);
        assertThat(completedResults.getContent()).hasSize(1);
        assertThat(ongoingResults.getContent().get(0).getStatus()).isEqualTo("ongoing");
        assertThat(completedResults.getContent().get(0).getStatus()).isEqualTo("completed");
    }

    @Test
    void shouldCountAllMangas() {
        // Given
        mangaService.save(createTestManga());
        
        Manga manga2 = createTestManga();
        manga2.setApiId("test-api-id-2");
        mangaService.save(manga2);
        
        // When
        long count = mangaService.countAll();
        
        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    void shouldCheckIfMangaExists() {
        // Given
        Manga manga = mangaService.save(createTestManga());
        
        // When
        boolean exists = mangaService.existsById(manga.getId());
        boolean notExists = mangaService.existsById("non-existent-id");
        
        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void shouldHandleEmptySearchQuery() {
        // Given
        mangaService.save(createTestManga());
        
        // When
        Page<Manga> results = mangaService.searchByTitle("", "pt-br", PageRequest.of(0, 10));
        
        // Then
        assertThat(results.getContent()).hasSize(1);
    }

    @Test
    void shouldHandleNullSearchQuery() {
        // Given
        mangaService.save(createTestManga());
        
        // When
        Page<Manga> results = mangaService.searchByTitle(null, "pt-br", PageRequest.of(0, 10));
        
        // Then
        assertThat(results.getContent()).hasSize(1);
    }

    /**
     * Cria um manga de teste com dados válidos
     */
    private Manga createTestManga() {
        Manga manga = new Manga();
        manga.setApiId("test-api-id");
        manga.setTitle(Map.of(
            "pt-br", "Teste Mangá",
            "en", "Test Manga"
        ));
        manga.setDescription(Map.of(
            "pt-br", "Descrição do teste",
            "en", "Test description"
        ));
        manga.setStatus("ongoing");
        manga.setYear("2024");
        manga.setRating(8.5);
        manga.setRatingCount(100);
        manga.setViews(1000);
        manga.setFollows(500);
        manga.setCoverImage("https://example.com/cover.jpg");
        
        return manga;
    }
}