package com.reader_hub.domain.service;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.ExternalMangaDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Manga;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.function.BiConsumer;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DataPopulationService {

    private final ApiService apiService;
    private final MangaService mangaService;
    private final AuthorService authorService;
    private final ChapterService chapterService;

    private static final int BATCH_SIZE = 50;
    private static final long API_DELAY_MS = 500;

    /**
     * Resultado da população de dados
     */
    @Getter
    @RequiredArgsConstructor
    public static class PopulationResult {
        private final int mangasSaved;
        private final int authorsSaved;
        private final long totalFound;
        private final String message;
    }

    /**
     * Resultado da população completa
     */
    @Getter
    @RequiredArgsConstructor
    public static class PopulationCompleteResult {
        private final PopulationResult mangaResult;
        private final int totalChaptersSaved;
        private final Boolean includeChapters;
    }

    /**
     * Método genérico para popular mangás com rate limiting
     */
    public PopulationResult populateMangas(PaginatedDto<ExternalMangaDto> mangaDtoPage, String operationType) {
        log.info("Iniciando {} - {} mangás encontrados", operationType, mangaDtoPage.getTotal());

        int savedCount = 0;
        int authorsSavedCount = 0;

        for (ExternalMangaDto mangaDto : mangaDtoPage.getData()) {
            try {
                // Rate limiting para respeitar a API externa
                rateLimitDelay();

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
    private int processRelatedAuthors(ExternalMangaDto mangaDto) {
        int count = 0;
        
        if (mangaDto.getRelationships() != null) {
            for (ExternalMangaDto.SimpleRelationship relationship : mangaDto.getRelationships()) {
                if ("author".equals(relationship.getType())) {
                    try {
                        rateLimitDelay();
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
        PaginatedDto<ExternalMangaDto> popularMangas = apiService.getPopularMangas(limit, offset);
        return populateMangas(popularMangas, "População de mangás populares");
    }

    /**
     * Popular mangás recentes
     */
    public PopulationResult populateRecentMangas(Integer limit, Integer offset) {
        PaginatedDto<ExternalMangaDto> recentMangas = apiService.getRecentMangas(limit, offset);
        return populateMangas(recentMangas, "População de mangás recentes");
    }

    /**
     * Buscar e salvar mangás por título
     */
    public PopulationResult searchAndSaveMangas(String title, Integer limit, Integer offset) {
        List<ExternalMangaDto> searchResults = apiService.searchMangas(title, limit, offset);
        
        PaginatedDto<ExternalMangaDto> paginatedResults = new PaginatedDto<>(
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
        int count = chapterService.populateChaptersForManga(mangaId);
        log.info("População de capítulos concluída - {} capítulos salvos para manga {}", count, mangaId);
        return count;
    }

    /**
     * Popular capítulos de um manga com callback de progresso (para SSE streaming).
     */
    public int populateChaptersForMangaWithProgress(String mangaId, BiConsumer<Integer, Integer> progressCallback) {
        int count = chapterService.populateChaptersForManga(mangaId, progressCallback);
        log.info("População de capítulos concluída - {} capítulos salvos para manga {}", count, mangaId);
        return count;
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
     * Operação completa: mangás + capítulos.
     * Usa batching ao invés de carregar todos os mangás de uma vez.
     */
    @Transactional
    public PopulationCompleteResult populateComplete(Integer mangaLimit, Integer offset, Boolean includeChapters) {
        log.info("Iniciando população completa - mangaLimit: {}, includeChapters: {}", 
                 mangaLimit, includeChapters);

        // Popular mangás
        PopulationResult mangaResult = populatePopularMangas(mangaLimit, offset);
        
        int totalChaptersSaved = 0;
        
        if (Boolean.TRUE.equals(includeChapters)) {
            // Usar paginação em batches ao invés de carregar tudo em memória
            int page = 0;
            Page<Manga> mangaPage;
            
            do {
                mangaPage = mangaService.findAll(PageRequest.of(page, BATCH_SIZE));
                
                for (Manga manga : mangaPage.getContent()) {
                    try {
                        totalChaptersSaved += populateChaptersForManga(manga.getId());
                    } catch (Exception e) {
                        log.warn("Erro ao popular capítulos do manga {}: {}", manga.getId(), e.getMessage());
                    }
                }
                
                page++;
            } while (mangaPage.hasNext());
        }
        
        return new PopulationCompleteResult(mangaResult, totalChaptersSaved, includeChapters);
    }

    /**
     * Atualiza as imagens das capas dos mangas existentes.
     * Usa batching para evitar carregar todos os registros em memória.
     */
    @Transactional
    public void updateCoverImages() {
        log.info("Iniciando atualização das imagens das capas...");
        
        int updatedCount = 0;
        int page = 0;
        Page<Manga> mangaPage;
        
        do {
            mangaPage = mangaService.findAll(PageRequest.of(page, BATCH_SIZE));
            
            for (Manga manga : mangaPage.getContent()) {
                try {
                    if (manga.getApiId() != null && !manga.getApiId().startsWith("manual-")) {
                        rateLimitDelay();
                        String coverImageUrl = apiService.getMangaCoverUrl(manga.getApiId());
                        if (coverImageUrl != null) {
                            manga.setCoverImage(coverImageUrl);
                            mangaService.save(manga);
                            updatedCount++;
                            log.debug("Imagem da capa atualizada para manga: {}", manga.getApiId());
                        }
                    }
                } catch (Exception e) {
                    log.error("Erro ao atualizar imagem da capa para manga {}: {}", manga.getApiId(), e.getMessage());
                }
            }
            
            page++;
        } while (mangaPage.hasNext());
        
        log.info("Atualização concluída. {} mangas atualizados.", updatedCount);
    }

    /**
     * Rate limiting simples para respeitar limites da API externa.
     */
    private void rateLimitDelay() {
        try {
            Thread.sleep(API_DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Thread interrompida durante rate limit delay");
        }
    }
}
