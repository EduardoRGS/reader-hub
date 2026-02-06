package com.reader_hub.domain.service;

import com.reader_hub.application.dto.CreateMangaDto;
import com.reader_hub.application.dto.ExternalMangaDto;
import com.reader_hub.application.exception.DuplicateResourceException;
import com.reader_hub.application.exception.ResourceNotFoundException;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.repository.MangaRepository;
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
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MangaService - Testes Unitários")
class MangaServiceTest {

    @Mock
    private MangaRepository mangaRepository;

    @Mock
    private AuthorService authorService;

    @Mock
    private ApiService apiService;

    @InjectMocks
    private MangaService mangaService;

    private Manga testManga;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        testManga = new Manga();
        testManga.setId("manga-123");
        testManga.setApiId("api-123");
        testManga.setTitle(Map.of("pt-br", "Teste Manga", "en", "Test Manga"));
        testManga.setDescription(Map.of("pt-br", "Descrição", "en", "Description"));
        testManga.setStatus("ongoing");
        testManga.setYear("2024");
        testManga.setRating(8.5);
        testManga.setViews(1000);
        testManga.setFollows(500);

        pageable = PageRequest.of(0, 20);
    }

    @Nested
    @DisplayName("findAll")
    class FindAll {
        @Test
        @DisplayName("deve retornar página de mangás")
        void shouldReturnPageOfMangas() {
            Page<Manga> page = new PageImpl<>(List.of(testManga));
            when(mangaRepository.findAll(pageable)).thenReturn(page);

            Page<Manga> result = mangaService.findAll(pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getApiId()).isEqualTo("api-123");
            verify(mangaRepository).findAll(pageable);
        }

        @Test
        @DisplayName("deve retornar página vazia quando sem dados")
        void shouldReturnEmptyPageWhenNoData() {
            when(mangaRepository.findAll(pageable)).thenReturn(Page.empty());

            Page<Manga> result = mangaService.findAll(pageable);

            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindById {
        @Test
        @DisplayName("deve retornar manga quando encontrado")
        void shouldReturnMangaWhenFound() {
            when(mangaRepository.findById("manga-123")).thenReturn(Optional.of(testManga));

            Optional<Manga> result = mangaService.findById("manga-123");

            assertThat(result).isPresent();
            assertThat(result.get().getTitle()).containsEntry("pt-br", "Teste Manga");
        }

        @Test
        @DisplayName("deve retornar vazio quando não encontrado")
        void shouldReturnEmptyWhenNotFound() {
            when(mangaRepository.findById("inexistente")).thenReturn(Optional.empty());

            Optional<Manga> result = mangaService.findById("inexistente");

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("save")
    class Save {
        @Test
        @DisplayName("deve salvar e retornar manga")
        void shouldSaveAndReturnManga() {
            when(mangaRepository.save(testManga)).thenReturn(testManga);

            Manga result = mangaService.save(testManga);

            assertThat(result.getId()).isEqualTo("manga-123");
            verify(mangaRepository).save(testManga);
        }
    }

    @Nested
    @DisplayName("findByStatus")
    class FindByStatus {
        @Test
        @DisplayName("deve filtrar mangás por status")
        void shouldFilterMangasByStatus() {
            Page<Manga> page = new PageImpl<>(List.of(testManga));
            when(mangaRepository.findByStatus("ongoing", pageable)).thenReturn(page);

            Page<Manga> result = mangaService.findByStatus("ongoing", pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getStatus()).isEqualTo("ongoing");
        }
    }

    @Nested
    @DisplayName("findByYear")
    class FindByYear {
        @Test
        @DisplayName("deve filtrar mangás por ano")
        void shouldFilterMangasByYear() {
            Page<Manga> page = new PageImpl<>(List.of(testManga));
            when(mangaRepository.findByYear("2024", pageable)).thenReturn(page);

            Page<Manga> result = mangaService.findByYear("2024", pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getYear()).isEqualTo("2024");
        }
    }

    @Nested
    @DisplayName("existsById")
    class ExistsById {
        @Test
        @DisplayName("deve retornar true quando existe")
        void shouldReturnTrueWhenExists() {
            when(mangaRepository.existsById("manga-123")).thenReturn(true);

            assertThat(mangaService.existsById("manga-123")).isTrue();
        }

        @Test
        @DisplayName("deve retornar false quando não existe")
        void shouldReturnFalseWhenNotExists() {
            when(mangaRepository.existsById("inexistente")).thenReturn(false);

            assertThat(mangaService.existsById("inexistente")).isFalse();
        }
    }

    @Nested
    @DisplayName("countAll")
    class CountAll {
        @Test
        @DisplayName("deve retornar contagem de mangás")
        void shouldReturnMangaCount() {
            when(mangaRepository.count()).thenReturn(42L);

            assertThat(mangaService.countAll()).isEqualTo(42L);
        }
    }

    @Nested
    @DisplayName("createManga (via API externa)")
    class CreateManga {
        @Test
        @DisplayName("deve criar manga a partir de DTO externo")
        void shouldCreateMangaFromExternalDto() {
            ExternalMangaDto dto = createExternalMangaDto();

            when(mangaRepository.existsByApiId("ext-123")).thenReturn(false);
            when(mangaRepository.save(any(Manga.class))).thenAnswer(inv -> {
                Manga m = inv.getArgument(0);
                m.setId("new-id");
                return m;
            });
            when(apiService.getMangaCoverUrl("ext-123")).thenReturn("https://cover.jpg");

            Manga result = mangaService.createManga(dto);

            assertThat(result.getApiId()).isEqualTo("ext-123");
            assertThat(result.getCoverImage()).isEqualTo("https://cover.jpg");
            verify(mangaRepository).save(any(Manga.class));
        }

        @Test
        @DisplayName("deve lançar DuplicateResourceException quando manga já existe")
        void shouldThrowWhenMangaAlreadyExists() {
            ExternalMangaDto dto = createExternalMangaDto();
            when(mangaRepository.existsByApiId("ext-123")).thenReturn(true);

            assertThatThrownBy(() -> mangaService.createManga(dto))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("ext-123");

            verify(mangaRepository, never()).save(any());
        }

        @Test
        @DisplayName("deve continuar mesmo se busca de capa falhar")
        void shouldContinueWhenCoverFetchFails() {
            ExternalMangaDto dto = createExternalMangaDto();
            when(mangaRepository.existsByApiId("ext-123")).thenReturn(false);
            when(apiService.getMangaCoverUrl("ext-123")).thenThrow(new RuntimeException("API fora do ar"));
            when(mangaRepository.save(any(Manga.class))).thenAnswer(inv -> inv.getArgument(0));

            Manga result = mangaService.createManga(dto);

            assertThat(result.getCoverImage()).isNull();
            verify(mangaRepository).save(any(Manga.class));
        }
    }

    @Nested
    @DisplayName("createMangaManual")
    class CreateMangaManual {
        @Test
        @DisplayName("deve criar manga manual com apiId sintético")
        void shouldCreateManualMangaWithSyntheticApiId() {
            CreateMangaDto dto = new CreateMangaDto();
            dto.setTitle("Meu Manga");
            dto.setStatus("ongoing");
            dto.setYear("2025");

            when(mangaRepository.save(any(Manga.class))).thenAnswer(inv -> {
                Manga m = inv.getArgument(0);
                m.setId("generated-id");
                return m;
            });

            Manga result = mangaService.createMangaManual(dto);

            assertThat(result.getApiId()).startsWith("manual-");
            assertThat(result.getTitle()).containsEntry("pt-br", "Meu Manga");
            assertThat(result.getStatus()).isEqualTo("ongoing");
        }

        @Test
        @DisplayName("deve usar títulos multilíngues quando fornecidos")
        void shouldUseMultilingualTitlesWhenProvided() {
            CreateMangaDto dto = new CreateMangaDto();
            dto.setTitle("Fallback");
            dto.setTitles(Map.of("pt-br", "Titulo BR", "en", "Title EN"));
            dto.setStatus("completed");

            when(mangaRepository.save(any(Manga.class))).thenAnswer(inv -> inv.getArgument(0));

            Manga result = mangaService.createMangaManual(dto);

            assertThat(result.getTitle()).containsEntry("pt-br", "Titulo BR");
            assertThat(result.getTitle()).containsEntry("en", "Title EN");
        }

        @Test
        @DisplayName("deve associar autor quando fornecido")
        void shouldAssociateAuthorWhenProvided() {
            Author author = new Author();
            author.setId("author-1");
            author.setName("Autor Teste");

            CreateMangaDto dto = new CreateMangaDto();
            dto.setTitle("Com Autor");
            dto.setStatus("ongoing");
            dto.setAuthorId("author-1");

            when(authorService.findById("author-1")).thenReturn(Optional.of(author));
            when(mangaRepository.save(any(Manga.class))).thenAnswer(inv -> inv.getArgument(0));

            Manga result = mangaService.createMangaManual(dto);

            assertThat(result.getAuthor()).isNotNull();
            assertThat(result.getAuthor().getName()).isEqualTo("Autor Teste");
        }

        @Test
        @DisplayName("deve lançar ResourceNotFoundException quando autor não existe")
        void shouldThrowWhenAuthorNotFound() {
            CreateMangaDto dto = new CreateMangaDto();
            dto.setTitle("Sem Autor");
            dto.setStatus("ongoing");
            dto.setAuthorId("autor-inexistente");

            when(authorService.findById("autor-inexistente")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> mangaService.createMangaManual(dto))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Autor");
        }
    }

    @Nested
    @DisplayName("searchByTitle")
    class SearchByTitle {
        @Test
        @DisplayName("deve retornar todos quando query é nula")
        void shouldReturnAllWhenQueryIsNull() {
            Page<Manga> page = new PageImpl<>(List.of(testManga));
            when(mangaRepository.findAll(pageable)).thenReturn(page);

            Page<Manga> result = mangaService.searchByTitle(null, "pt-br", pageable);

            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("deve retornar todos quando query é vazia")
        void shouldReturnAllWhenQueryIsEmpty() {
            Page<Manga> page = new PageImpl<>(List.of(testManga));
            when(mangaRepository.findAll(pageable)).thenReturn(page);

            Page<Manga> result = mangaService.searchByTitle("", "pt-br", pageable);

            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {
        @Test
        @DisplayName("deve deletar manga")
        void shouldDeleteManga() {
            doNothing().when(mangaRepository).delete(testManga);

            mangaService.delete(testManga);

            verify(mangaRepository).delete(testManga);
        }
    }

    // ===== Helpers =====

    private ExternalMangaDto createExternalMangaDto() {
        ExternalMangaDto dto = new ExternalMangaDto();
        dto.setId("ext-123");

        ExternalMangaDto.ApiMangaAttributes attrs = new ExternalMangaDto.ApiMangaAttributes();
        attrs.setTitle(Map.of("en", "External Manga"));
        attrs.setDescription(Map.of("en", "A great manga"));
        attrs.setStatus("ongoing");
        attrs.setYear("2024");
        dto.setAttributes(attrs);

        return dto;
    }
}
