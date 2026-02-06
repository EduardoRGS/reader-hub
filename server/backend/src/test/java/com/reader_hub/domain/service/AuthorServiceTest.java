package com.reader_hub.domain.service;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.exception.ResourceNotFoundException;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Language;
import com.reader_hub.domain.repository.AuthorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthorService - Testes Unitários")
class AuthorServiceTest {

    @Mock
    private AuthorRepository authorRepository;

    @InjectMocks
    private AuthorService authorService;

    private Author testAuthor;

    @BeforeEach
    void setUp() {
        testAuthor = new Author();
        testAuthor.setId("author-123");
        testAuthor.setApiId("api-author-123");
        testAuthor.setName("Mangaká Teste");
        Language bio = new Language();
        bio.setEn("English bio");
        bio.setPt_BR("Bio em português");
        testAuthor.setBiography(bio);
    }

    @Nested
    @DisplayName("saveAuthor")
    class SaveAuthor {
        @Test
        @DisplayName("deve salvar novo autor")
        void shouldSaveNewAuthor() {
            Author newAuthor = new Author();
            newAuthor.setName("Novo Autor");
            when(authorRepository.save(newAuthor)).thenReturn(newAuthor);

            Author result = authorService.saveAuthor(newAuthor);

            assertThat(result.getName()).isEqualTo("Novo Autor");
            verify(authorRepository).save(newAuthor);
        }

        @Test
        @DisplayName("deve retornar existente quando apiId já cadastrado")
        void shouldReturnExistingWhenApiIdAlreadyExists() {
            Author newAuthor = new Author();
            newAuthor.setApiId("api-author-123");
            newAuthor.setName("Duplicado");

            when(authorRepository.findByApiId("api-author-123")).thenReturn(Optional.of(testAuthor));

            Author result = authorService.saveAuthor(newAuthor);

            assertThat(result.getName()).isEqualTo("Mangaká Teste");
            verify(authorRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("createAuthor")
    class CreateAuthor {
        @Test
        @DisplayName("deve criar autor a partir de DTO")
        void shouldCreateAuthorFromDto() {
            AuthorDto dto = createAuthorDto("new-api-id", "Novo Mangaká");
            when(authorRepository.findByApiId("new-api-id")).thenReturn(Optional.empty());
            when(authorRepository.save(any(Author.class))).thenAnswer(inv -> {
                Author a = inv.getArgument(0);
                a.setId("generated-id");
                return a;
            });

            Author result = authorService.createAuthor(dto);

            assertThat(result.getApiId()).isEqualTo("new-api-id");
            assertThat(result.getName()).isEqualTo("Novo Mangaká");
        }

        @Test
        @DisplayName("deve retornar existente quando apiId já cadastrado")
        void shouldReturnExistingWhenAlreadyExists() {
            AuthorDto dto = createAuthorDto("api-author-123", "Duplicado");
            when(authorRepository.findByApiId("api-author-123")).thenReturn(Optional.of(testAuthor));

            Author result = authorService.createAuthor(dto);

            assertThat(result.getName()).isEqualTo("Mangaká Teste");
            verify(authorRepository, never()).save(any());
        }

        @Test
        @DisplayName("deve salvar biografia quando disponível")
        void shouldSaveBiographyWhenAvailable() {
            AuthorDto dto = createAuthorDto("bio-id", "Com Bio");
            dto.getAttributes().setBiography(Map.of("en", "English bio", "pt-br", "Bio BR"));

            when(authorRepository.findByApiId("bio-id")).thenReturn(Optional.empty());
            when(authorRepository.save(any(Author.class))).thenAnswer(inv -> inv.getArgument(0));

            Author result = authorService.createAuthor(dto);

            assertThat(result.getBiography()).isNotNull();
            assertThat(result.getBiography().getEn()).isEqualTo("English bio");
            assertThat(result.getBiography().getPt_BR()).isEqualTo("Bio BR");
        }
    }

    @Nested
    @DisplayName("updateAuthor")
    class UpdateAuthor {
        @Test
        @DisplayName("deve atualizar autor existente")
        void shouldUpdateExistingAuthor() {
            when(authorRepository.existsById("author-123")).thenReturn(true);
            when(authorRepository.save(testAuthor)).thenReturn(testAuthor);

            Author result = authorService.updateAuthor(testAuthor);

            assertThat(result.getId()).isEqualTo("author-123");
        }

        @Test
        @DisplayName("deve lançar exceção quando autor não existe")
        void shouldThrowWhenAuthorNotFound() {
            testAuthor.setId("inexistente");
            when(authorRepository.existsById("inexistente")).thenReturn(false);

            assertThatThrownBy(() -> authorService.updateAuthor(testAuthor))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Autor");
        }
    }

    @Nested
    @DisplayName("deleteAuthor")
    class DeleteAuthor {
        @Test
        @DisplayName("deve deletar autor existente")
        void shouldDeleteExistingAuthor() {
            when(authorRepository.existsById("author-123")).thenReturn(true);
            doNothing().when(authorRepository).deleteById("author-123");

            authorService.deleteAuthor("author-123");

            verify(authorRepository).deleteById("author-123");
        }

        @Test
        @DisplayName("deve lançar exceção quando autor não encontrado para deleção")
        void shouldThrowWhenDeletingNonExistent() {
            when(authorRepository.existsById("inexistente")).thenReturn(false);

            assertThatThrownBy(() -> authorService.deleteAuthor("inexistente"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Queries de busca")
    class SearchQueries {
        @Test
        @DisplayName("deve buscar por nome parcial")
        void shouldFindByNameContaining() {
            when(authorRepository.findByNameContainingIgnoreCase("Manga"))
                    .thenReturn(List.of(testAuthor));

            List<Author> result = authorService.findByNameContaining("Manga");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).contains("Mangaká");
        }

        @Test
        @DisplayName("deve listar todos os autores")
        void shouldFindAll() {
            when(authorRepository.findAll()).thenReturn(List.of(testAuthor));

            List<Author> result = authorService.findAll();

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("deve contar todos os autores")
        void shouldCountAll() {
            when(authorRepository.count()).thenReturn(15L);

            assertThat(authorService.countAll()).isEqualTo(15L);
        }
    }

    // ===== Helpers =====

    private AuthorDto createAuthorDto(String apiId, String name) {
        AuthorDto dto = new AuthorDto();
        dto.setId(apiId);
        AuthorDto.ApiAuthorAttributes attrs = new AuthorDto.ApiAuthorAttributes();
        attrs.setName(name);
        dto.setAttributes(attrs);
        return dto;
    }
}
