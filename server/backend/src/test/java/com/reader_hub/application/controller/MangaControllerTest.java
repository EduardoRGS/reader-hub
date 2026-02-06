package com.reader_hub.application.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reader_hub.application.dto.CreateMangaDto;
import com.reader_hub.application.exception.DuplicateResourceException;
import com.reader_hub.application.exception.GlobalExceptionHandler;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.service.MangaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MangaController.class)
@DisplayName("MangaController - Testes de Integração")
class MangaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ApiService apiService;

    @MockitoBean
    private MangaService mangaService;

    private Manga testManga;

    @BeforeEach
    void setUp() {
        testManga = new Manga();
        testManga.setId("manga-123");
        testManga.setApiId("api-123");
        testManga.setTitle(Map.of("pt-br", "Solo Leveling", "en", "Solo Leveling"));
        testManga.setDescription(Map.of("pt-br", "Descrição teste"));
        testManga.setStatus("completed");
        testManga.setYear("2018");
        testManga.setCreatedAt(OffsetDateTime.now());
        testManga.setUpdatedAt(OffsetDateTime.now());
        testManga.setViews(50000);
        testManga.setFollows(15000);
        testManga.setRating(9.2);
        testManga.setRatingCount(5000);
    }

    @Nested
    @DisplayName("GET /api/manga")
    class GetLocalMangas {
        @Test
        @DisplayName("deve retornar lista paginada de mangás")
        void shouldReturnPaginatedMangas() throws Exception {
            Page<Manga> page = new PageImpl<>(List.of(testManga), PageRequest.of(0, 20), 1);
            when(mangaService.findAll(any())).thenReturn(page);

            mockMvc.perform(get("/api/manga")
                            .param("limit", "20")
                            .param("offset", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].status").value("completed"))
                    .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @DisplayName("deve retornar página vazia")
        void shouldReturnEmptyPage() throws Exception {
            when(mangaService.findAll(any())).thenReturn(Page.empty());

            mockMvc.perform(get("/api/manga"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.empty").value(true));
        }

        @Test
        @DisplayName("deve rejeitar limit menor que 1")
        void shouldRejectLimitLessThan1() throws Exception {
            mockMvc.perform(get("/api/manga").param("limit", "0"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value("error"));
        }

        @Test
        @DisplayName("deve rejeitar limit maior que 100")
        void shouldRejectLimitGreaterThan100() throws Exception {
            mockMvc.perform(get("/api/manga").param("limit", "101"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/manga/local/{id}")
    class GetLocalMangaById {
        @Test
        @DisplayName("deve retornar manga quando encontrado")
        void shouldReturnMangaWhenFound() throws Exception {
            when(mangaService.findById("manga-123")).thenReturn(Optional.of(testManga));

            mockMvc.perform(get("/api/manga/local/manga-123"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("manga-123"))
                    .andExpect(jsonPath("$.status").value("completed"))
                    .andExpect(jsonPath("$.year").value("2018"));
        }

        @Test
        @DisplayName("deve retornar 404 quando não encontrado")
        void shouldReturn404WhenNotFound() throws Exception {
            when(mangaService.findById("inexistente")).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/manga/local/inexistente"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/manga/manual")
    class CreateMangaManual {
        @Test
        @DisplayName("deve criar manga manual com dados válidos")
        void shouldCreateMangaWithValidData() throws Exception {
            CreateMangaDto dto = new CreateMangaDto();
            dto.setTitle("Novo Manga");
            dto.setStatus("ongoing");
            dto.setYear("2025");

            Manga created = new Manga();
            created.setId("new-id");
            created.setApiId("manual-uuid");
            created.setTitle(Map.of("pt-br", "Novo Manga"));
            created.setStatus("ongoing");
            created.setYear("2025");
            created.setCreatedAt(OffsetDateTime.now());
            created.setUpdatedAt(OffsetDateTime.now());
            created.setViews(0);
            created.setFollows(0);
            created.setRating(0.0);
            created.setRatingCount(0);

            when(mangaService.createMangaManual(any())).thenReturn(created);

            mockMvc.perform(post("/api/manga/manual")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("new-id"))
                    .andExpect(jsonPath("$.status").value("ongoing"));
        }

        @Test
        @DisplayName("deve rejeitar manga sem título")
        void shouldRejectMangaWithoutTitle() throws Exception {
            CreateMangaDto dto = new CreateMangaDto();
            dto.setStatus("ongoing");

            mockMvc.perform(post("/api/manga/manual")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.title").exists());
        }

        @Test
        @DisplayName("deve rejeitar manga sem status")
        void shouldRejectMangaWithoutStatus() throws Exception {
            CreateMangaDto dto = new CreateMangaDto();
            dto.setTitle("Titulo OK");

            mockMvc.perform(post("/api/manga/manual")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.validationErrors.status").exists());
        }

        @Test
        @DisplayName("deve rejeitar status inválido")
        void shouldRejectInvalidStatus() throws Exception {
            CreateMangaDto dto = new CreateMangaDto();
            dto.setTitle("Titulo OK");
            dto.setStatus("invalido");

            mockMvc.perform(post("/api/manga/manual")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("deve rejeitar ano com formato inválido")
        void shouldRejectInvalidYearFormat() throws Exception {
            CreateMangaDto dto = new CreateMangaDto();
            dto.setTitle("Titulo OK");
            dto.setStatus("ongoing");
            dto.setYear("24");

            mockMvc.perform(post("/api/manga/manual")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("deve rejeitar rating fora do intervalo")
        void shouldRejectRatingOutOfRange() throws Exception {
            CreateMangaDto dto = new CreateMangaDto();
            dto.setTitle("Titulo OK");
            dto.setStatus("ongoing");
            dto.setRating(11.0);

            mockMvc.perform(post("/api/manga/manual")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/manga/by-status/{status}")
    class GetByStatus {
        @Test
        @DisplayName("deve retornar mangás por status")
        void shouldReturnMangasByStatus() throws Exception {
            Page<Manga> page = new PageImpl<>(List.of(testManga), PageRequest.of(0, 20), 1);
            when(mangaService.findByStatus(any(), any())).thenReturn(page);

            mockMvc.perform(get("/api/manga/by-status/completed"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("GET /api/manga/by-year/{year}")
    class GetByYear {
        @Test
        @DisplayName("deve retornar mangás por ano")
        void shouldReturnMangasByYear() throws Exception {
            Page<Manga> page = new PageImpl<>(List.of(testManga), PageRequest.of(0, 20), 1);
            when(mangaService.findByYear(any(), any())).thenReturn(page);

            mockMvc.perform(get("/api/manga/by-year/2018"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }
    }
}
