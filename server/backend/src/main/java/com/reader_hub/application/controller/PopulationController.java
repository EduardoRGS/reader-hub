package com.reader_hub.application.controller;

import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.service.AuthorService;
import com.reader_hub.domain.service.ChapterService;
import com.reader_hub.domain.service.DataPopulationService;
import com.reader_hub.domain.service.MangaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/populate")
@RequiredArgsConstructor
@Slf4j
public class PopulationController {

    private final DataPopulationService dataPopulationService;
    private final MangaService mangaService;
    private final AuthorService authorService;
    private final ChapterService chapterService;

    /**
     * Popula o banco com mangas populares da API MangaDX
     */
    @PostMapping("/popular-mangas")
    public ResponseEntity<Map<String, Object>> populatePopularMangas(
            @RequestParam(defaultValue = "50") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {
        
        try {
            DataPopulationService.PopulationResult result = 
                dataPopulationService.populatePopularMangas(limit, offset);
            
            return ResponseEntity.ok(createSuccessResponse(result, limit, offset, null));
            
        } catch (Exception e) {
            log.error("Erro durante população de mangas populares", e);
            return ResponseEntity.internalServerError().body(createErrorResponse(
                "Erro durante população: " + e.getMessage()));
        }
    }

    /**
     * Popula o banco com mangas recentes da API MangaDX
     */
    @PostMapping("/recent-mangas")
    public ResponseEntity<Map<String, Object>> populateRecentMangas(
            @RequestParam(defaultValue = "50") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {
        
        try {
            DataPopulationService.PopulationResult result = 
                dataPopulationService.populateRecentMangas(limit, offset);
            
            return ResponseEntity.ok(createSuccessResponse(result, limit, offset, null));
            
        } catch (Exception e) {
            log.error("Erro durante população de mangas recentes", e);
            return ResponseEntity.internalServerError().body(createErrorResponse(
                "Erro durante população: " + e.getMessage()));
        }
    }

    /**
     * Busca mangas por título e salva no banco
     */
    @PostMapping("/search-and-save")
    public ResponseEntity<Map<String, Object>> searchAndSaveMangas(
            @RequestParam String title,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {
        
        try {
            DataPopulationService.PopulationResult result = 
                dataPopulationService.searchAndSaveMangas(title, limit, offset);
            
            return ResponseEntity.ok(createSuccessResponse(result, limit, offset, title));
            
        } catch (Exception e) {
            log.error("Erro durante busca e salvamento de mangas", e);
            return ResponseEntity.internalServerError().body(createErrorResponse(
                "Erro durante busca e salvamento: " + e.getMessage()));
        }
    }

    /**
     * Popula capítulos de um manga específico
     */
    @PostMapping("/chapters/{mangaId}")
    public ResponseEntity<Map<String, Object>> populateChaptersForManga(@PathVariable String mangaId) {
        try {
            int chaptersSaved = dataPopulationService.populateChaptersForManga(mangaId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "População de capítulos concluída");
            response.put("mangaId", mangaId);
            response.put("chaptersSaved", chaptersSaved);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Erro durante população de capítulos para manga {}", mangaId, e);
            return ResponseEntity.internalServerError().body(createErrorResponse(
                "Erro durante população de capítulos: " + e.getMessage()));
        }
    }

    /**
     * Popula autores do banco de dados
     */
    @PostMapping("/authors")
    public ResponseEntity<Map<String, Object>> populateAuthors(
            @RequestParam(defaultValue = "50") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {
        
        try {
            DataPopulationService.PopulationResult result = 
                dataPopulationService.populateAuthors(limit, offset);
            
            return ResponseEntity.ok(createSuccessResponse(result, limit, offset, null));
            
        } catch (Exception e) {
            log.error("Erro durante população de autores", e);
            return ResponseEntity.internalServerError().body(createErrorResponse(
                "Erro durante população de autores: " + e.getMessage()));
        }
    }

    /**
     * Obtém estatísticas do banco de dados - OTIMIZADO
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDatabaseStats() {
        try {
            // Otimizado: usar count queries em vez de buscar todos os registros
            long totalMangas = mangaService.countAll();
            long totalAuthors = authorService.countAll();
            long totalChapters = chapterService.countAll();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalMangas", totalMangas);
            stats.put("totalAuthors", totalAuthors);
            stats.put("totalChapters", totalChapters);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Erro ao obter estatísticas do banco", e);
            return ResponseEntity.internalServerError().body(createErrorResponse(
                "Erro ao obter estatísticas: " + e.getMessage()));
        }
    }

    /**
     * Operação completa: popula mangas populares + seus capítulos
     */
    @PostMapping("/complete-popular")
    public ResponseEntity<Map<String, Object>> populateCompletePopular(
            @RequestParam(defaultValue = "20") Integer mangaLimit,
            @RequestParam(defaultValue = "0") Integer offset,
            @RequestParam(defaultValue = "true") Boolean includeChapters) {
        
        try {
            DataPopulationService.PopulationCompleteResult result = 
                dataPopulationService.populateComplete(mangaLimit, offset, includeChapters);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "População completa concluída");
            response.put("mangaResult", createMangaResultMap(result.getMangaResult()));
            response.put("totalChaptersSaved", result.getTotalChaptersSaved());
            response.put("includeChapters", result.getIncludeChapters());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Erro durante população completa", e);
            return ResponseEntity.internalServerError().body(createErrorResponse(
                "Erro durante população completa: " + e.getMessage()));
        }
    }

    // =================== MÉTODOS AUXILIARES ===================

    /**
     * Cria resposta de sucesso padronizada
     */
    private Map<String, Object> createSuccessResponse(
            DataPopulationService.PopulationResult result, 
            Integer limit, Integer offset, String searchTerm) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", result.getMessage());
        response.put("totalFound", result.getTotalFound());
        response.put("mangasSaved", result.getMangasSaved());
        response.put("authorsSaved", result.getAuthorsSaved());
        response.put("limit", limit);
        response.put("offset", offset);
        
        if (searchTerm != null) {
            response.put("searchTerm", searchTerm);
        }
        
        return response;
    }

    /**
     * Cria resposta de erro padronizada
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", message);
        return response;
    }

    /**
     * Converte PopulationResult para Map
     */
    private Map<String, Object> createMangaResultMap(DataPopulationService.PopulationResult result) {
        Map<String, Object> map = new HashMap<>();
        map.put("message", result.getMessage());
        map.put("mangasSaved", result.getMangasSaved());
        map.put("authorsSaved", result.getAuthorsSaved());
        map.put("totalFound", result.getTotalFound());
        return map;
    }
} 