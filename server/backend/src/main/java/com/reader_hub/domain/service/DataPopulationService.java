package com.reader_hub.domain.service;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.MangaDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Chapter;
import com.reader_hub.domain.model.Manga;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DataPopulationService {

    private final ApiService apiService;
    private final MangaService mangaService;
    private final AuthorService authorService;
    private final ChapterService chapterService;

    /**
     * Resultado da população de dados
     */
    public static class PopulationResult {
        private final int mangasSaved;
        private final int authorsSaved;
        private final long totalFound;
        private final String message;

        public PopulationResult(int mangasSaved, int authorsSaved, long totalFound, String message) {
            this.mangasSaved = mangasSaved;
            this.authorsSaved = authorsSaved;
            this.totalFound = totalFound;
            this.message = message;
        }

        public int getMangasSaved() { return mangasSaved; }
        public int getAuthorsSaved() { return authorsSaved; }
        public long getTotalFound() { return totalFound; }
        public String getMessage() { return message; }
    }

    /**
     * Método genérico para popular mangás eliminando duplicação
     */
    public PopulationResult populateMangas(PaginatedDto<MangaDto> mangaDtoPage, String operationType) {
        log.info("Iniciando {} - {} mangás encontrados", operationType, mangaDtoPage.getTotal());

        int savedCount = 0;
        int authorsSavedCount = 0;

        for (MangaDto mangaDto : mangaDtoPage.getData()) {
            try {
                // Primeiro, salvar autores relacionados
                authorsSavedCount += processRelatedAuthors(mangaDto);

                // Então salvar o manga
                mangaService.createManga(mangaDto);
                savedCount++;

            } catch (Exception e) {
                log.warn("Erro ao salvar manga {}: {}", mangaDto.getId(), e.getMessage());
            }
        }

        String message = String.format("%s concluída - %d mangás e %d autores salvos", 
                                       operationType, savedCount, authorsSavedCount);
        
        return new PopulationResult(savedCount, authorsSavedCount, mangaDtoPage.getTotal(), message);
    }

    /**
     * Processa autores relacionados a um manga
     */
    private int processRelatedAuthors(MangaDto mangaDto) {
        int count = 0;
        
        if (mangaDto.getRelationships() != null) {
            for (MangaDto.SimpleRelationship relationship : mangaDto.getRelationships()) {
                if ("author".equals(relationship.getType())) {
                    try {
                        Optional<AuthorDto> authorDto = apiService.getAuthorById(relationship.getId());
                        if (authorDto.isPresent()) {
                            authorService.createAuthor(authorDto.get());
                            count++;
                        }
                    } catch (Exception e) {
                        log.warn("Erro ao salvar autor {}: {}", relationship.getId(), e.getMessage());
                    }
                }
            }
        }
        
        return count;
    }

    /**
     * Popular mangás populares
     */
    public PopulationResult populatePopularMangas(Integer limit, Integer offset) {
        PaginatedDto<MangaDto> popularMangas = apiService.getPopularMangas(limit, offset);
        return populateMangas(popularMangas, "População de mangás populares");
    }

    /**
     * Popular mangás recentes
     */
    public PopulationResult populateRecentMangas(Integer limit, Integer offset) {
        PaginatedDto<MangaDto> recentMangas = apiService.getRecentMangas(limit, offset);
        return populateMangas(recentMangas, "População de mangás recentes");
    }

    /**
     * Buscar e salvar mangás por título
     */
    public PopulationResult searchAndSaveMangas(String title, Integer limit, Integer offset) {
        List<MangaDto> searchResults = apiService.searchMangas(title, limit, offset);
        
        // Converter List para PaginatedDto para reutilizar o método
        PaginatedDto<MangaDto> paginatedResults = new PaginatedDto<>(
            searchResults, 
            searchResults.size(), 
            offset, 
            limit
        );
        
        return populateMangas(paginatedResults, "Busca e salvamento de mangás por título: " + title);
    }

    /**
     * Popular capítulos de um manga
     */
    public int populateChaptersForManga(String mangaId) {
        List<Chapter> chapters = chapterService.populateChaptersForManga(mangaId);
        log.info("População de capítulos concluída - {} capítulos salvos para manga {}", 
                 chapters.size(), mangaId);
        return chapters.size();
    }

    /**
     * Popular autores
     */
    public PopulationResult populateAuthors(Integer limit, Integer offset) {
        log.info("Iniciando população de autores - limit: {}, offset: {}", limit, offset);
        
        PaginatedDto<AuthorDto> authors = apiService.getAuthors(limit, offset);
        int savedCount = 0;
        
        for (AuthorDto authorDto : authors.getData()) {
            try {
                authorService.createAuthor(authorDto);
                savedCount++;
            } catch (Exception e) {
                log.warn("Erro ao salvar autor {}: {}", authorDto.getId(), e.getMessage());
            }
        }
        
        String message = String.format("População de autores concluída - %d autores salvos", savedCount);
        return new PopulationResult(0, savedCount, authors.getTotal(), message);
    }

    /**
     * Operação completa: mangás + capítulos
     */
    @Transactional
    public PopulationCompleteResult populateComplete(Integer mangaLimit, Integer offset, Boolean includeChapters) {
        log.info("Iniciando população completa - mangaLimit: {}, includeChapters: {}", 
                 mangaLimit, includeChapters);

        // Popular mangás
        PopulationResult mangaResult = populatePopularMangas(mangaLimit, offset);
        
        int totalChaptersSaved = 0;
        
        if (includeChapters) {
            // Popular capítulos para todos os mangás
            List<Manga> allMangas = mangaService.findAll(
                org.springframework.data.domain.Pageable.unpaged()
            ).getContent();
            
            for (Manga manga : allMangas) {
                try {
                    totalChaptersSaved += populateChaptersForManga(manga.getId());
                } catch (Exception e) {
                    log.warn("Erro ao popular capítulos do manga {}: {}", manga.getId(), e.getMessage());
                }
            }
        }
        
        return new PopulationCompleteResult(mangaResult, totalChaptersSaved, includeChapters);
    }

    /**
     * Resultado da população completa
     */
    public static class PopulationCompleteResult {
        private final PopulationResult mangaResult;
        private final int totalChaptersSaved;
        private final Boolean includeChapters;

        public PopulationCompleteResult(PopulationResult mangaResult, int totalChaptersSaved, Boolean includeChapters) {
            this.mangaResult = mangaResult;
            this.totalChaptersSaved = totalChaptersSaved;
            this.includeChapters = includeChapters;
        }

        public PopulationResult getMangaResult() { return mangaResult; }
        public int getTotalChaptersSaved() { return totalChaptersSaved; }
        public Boolean getIncludeChapters() { return includeChapters; }
    }
} 