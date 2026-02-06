package com.reader_hub.domain.service;

import com.reader_hub.application.exception.ResourceNotFoundException;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Chapter;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.repository.ChapterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChapterService - Testes Unitários")
class ChapterServiceTest {

    @Mock
    private ChapterRepository chapterRepository;

    @Mock
    private ApiService apiService;

    @Mock
    private MangaService mangaService;

    @InjectMocks
    private ChapterService chapterService;

    private Chapter testChapter;
    private Manga testManga;

    @BeforeEach
    void setUp() {
        testManga = new Manga();
        testManga.setId("manga-1");
        testManga.setApiId("api-manga-1");
        testManga.setTitle(Map.of("pt-br", "Test Manga"));
        testManga.setStatus("ongoing");

        testChapter = new Chapter();
        testChapter.setId("ch-1");
        testChapter.setApiId("api-ch-1");
        testChapter.setTitle("Capítulo 1");
        testChapter.setChapter("1");
        testChapter.setVolume("1");
        testChapter.setPages(20);
        testChapter.setLanguage("pt-br");
        testChapter.setViews(0);
        testChapter.setComments(0);
        testChapter.setManga(testManga);
    }

    @Nested
    @DisplayName("findById")
    class FindById {
        @Test
        @DisplayName("deve retornar capítulo quando encontrado")
        void shouldReturnChapterWhenFound() {
            when(chapterRepository.findById("ch-1")).thenReturn(Optional.of(testChapter));

            Optional<Chapter> result = chapterService.findById("ch-1");

            assertThat(result).isPresent();
            assertThat(result.get().getTitle()).isEqualTo("Capítulo 1");
        }

        @Test
        @DisplayName("deve retornar vazio quando não encontrado")
        void shouldReturnEmptyWhenNotFound() {
            when(chapterRepository.findById("inexistente")).thenReturn(Optional.empty());

            assertThat(chapterService.findById("inexistente")).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByMangaId")
    class FindByMangaId {
        @Test
        @DisplayName("deve retornar capítulos do manga")
        void shouldReturnChaptersByMangaId() {
            when(chapterRepository.findByMangaIdOrderByChapter("manga-1"))
                    .thenReturn(List.of(testChapter));

            List<Chapter> result = chapterService.findByMangaId("manga-1");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getChapter()).isEqualTo("1");
        }
    }

    @Nested
    @DisplayName("findByMangaIdAndLanguage")
    class FindByMangaIdAndLanguage {
        @Test
        @DisplayName("deve filtrar por manga e idioma")
        void shouldFilterByMangaAndLanguage() {
            when(chapterRepository.findByMangaIdAndLanguage("manga-1", "pt-br"))
                    .thenReturn(List.of(testChapter));

            List<Chapter> result = chapterService.findByMangaIdAndLanguage("manga-1", "pt-br");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getLanguage()).isEqualTo("pt-br");
        }
    }

    @Nested
    @DisplayName("findLatestChapters")
    class FindLatestChapters {
        @Test
        @DisplayName("deve retornar capítulos mais recentes")
        void shouldReturnLatestChapters() {
            Page<Chapter> page = new PageImpl<>(List.of(testChapter));
            when(chapterRepository.findLatestChapters(any())).thenReturn(page);

            Page<Chapter> result = chapterService.findLatestChapters(PageRequest.of(0, 10));

            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("incrementViews")
    class IncrementViews {
        @Test
        @DisplayName("deve incrementar views do capítulo")
        void shouldIncrementChapterViews() {
            testChapter.setViews(5);
            when(chapterRepository.findById("ch-1")).thenReturn(Optional.of(testChapter));
            when(chapterRepository.save(any(Chapter.class))).thenAnswer(inv -> inv.getArgument(0));

            Chapter result = chapterService.incrementViews("ch-1");

            assertThat(result.getViews()).isEqualTo(6);
            verify(chapterRepository).save(testChapter);
        }

        @Test
        @DisplayName("deve lançar exceção quando capítulo não encontrado")
        void shouldThrowWhenChapterNotFound() {
            when(chapterRepository.findById("inexistente")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> chapterService.incrementViews("inexistente"))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Capítulo");
        }
    }

    @Nested
    @DisplayName("deleteChapter")
    class DeleteChapter {
        @Test
        @DisplayName("deve deletar capítulo existente")
        void shouldDeleteExistingChapter() {
            when(chapterRepository.existsById("ch-1")).thenReturn(true);
            doNothing().when(chapterRepository).deleteById("ch-1");

            chapterService.deleteChapter("ch-1");

            verify(chapterRepository).deleteById("ch-1");
        }

        @Test
        @DisplayName("deve lançar exceção quando capítulo não encontrado")
        void shouldThrowWhenDeletingNonExistent() {
            when(chapterRepository.existsById("inexistente")).thenReturn(false);

            assertThatThrownBy(() -> chapterService.deleteChapter("inexistente"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("saveChapter")
    class SaveChapter {
        @Test
        @DisplayName("deve salvar capítulo com manga válido")
        void shouldSaveChapterWithValidManga() {
            when(mangaService.existsById("manga-1")).thenReturn(true);
            when(chapterRepository.save(testChapter)).thenReturn(testChapter);

            Chapter result = chapterService.saveChapter(testChapter);

            assertThat(result.getId()).isEqualTo("ch-1");
            verify(chapterRepository).save(testChapter);
        }

        @Test
        @DisplayName("deve lançar exceção quando manga não encontrado")
        void shouldThrowWhenMangaNotFound() {
            when(mangaService.existsById("manga-1")).thenReturn(false);

            assertThatThrownBy(() -> chapterService.saveChapter(testChapter))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Manga");
        }
    }

    @Nested
    @DisplayName("countByMangaId")
    class CountByMangaId {
        @Test
        @DisplayName("deve retornar contagem de capítulos por manga")
        void shouldReturnChapterCountByManga() {
            when(chapterRepository.countByMangaId("manga-1")).thenReturn(25L);

            assertThat(chapterService.countByMangaId("manga-1")).isEqualTo(25L);
        }
    }
}
