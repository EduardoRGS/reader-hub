package com.reader_hub.application.controller;

import com.reader_hub.application.dto.PopulationRequestDto;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.service.AuthorService;
import com.reader_hub.domain.service.ChapterService;
import com.reader_hub.domain.service.DataPopulationService;
import com.reader_hub.domain.service.MangaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/populate")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "🔄 População", description = "População de dados da API externa")
public class PopulationController {

    private final DataPopulationService dataPopulationService;
    private final MangaService mangaService;
    private final AuthorService authorService;
    private final ChapterService chapterService;

    @Operation(
        summary = "Popular mangás populares",
        description = "Popula o banco de dados com mangás populares da API MangaDX"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "População realizada com sucesso",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                      "status": "success",
                      "message": "População de mangás populares concluída - 10 mangás e 15 autores salvos",
                      "totalFound": 86363,
                      "mangasSaved": 10,
                      "authorsSaved": 15,
                      "limit": 10,
                      "offset": 0
                    }
                    """
                )
            )
        ),
        @ApiResponse(responseCode = "400", description = "Parâmetros inválidos"),
        @ApiResponse(responseCode = "502", description = "Erro de comunicação com API externa")
    })
    @PostMapping("/popular-mangas")
    public ResponseEntity<Map<String, Object>> populatePopularMangas(
            @Parameter(description = "Número máximo de mangás para importar (1-100)", example = "20")
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{population.limit.range}")
            @Max(value = 100, message = "{population.limit.range}")
            Integer limit,
            
            @Parameter(description = "Número de itens a pular na API externa", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{population.offset.positive}")
            Integer offset) {
        
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

    @Operation(
        summary = "Popular mangás recentes",
        description = "Popula o banco de dados com mangás recentemente atualizados da API MangaDX"
    )
    @PostMapping("/recent-mangas")
    public ResponseEntity<Map<String, Object>> populateRecentMangas(
            @Parameter(description = "Número máximo de mangás para importar", example = "20")
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{population.limit.range}")
            @Max(value = 100, message = "{population.limit.range}")
            Integer limit,
            
            @Parameter(description = "Número de itens a pular na API externa", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{population.offset.positive}")
            Integer offset) {
        
        try {
            DataPopulationService.PopulationResult result = 
                dataPopulationService.populateRecentMangas(limit, offset);
            
            return ResponseEntity.ok(createSuccessResponse(result, limit, offset, null));
            
        } catch (Exception e) {
            log.error("Erro durante população de mangás recentes", e);
            return ResponseEntity.internalServerError().body(createErrorResponse(
                "Erro durante população: " + e.getMessage()));
        }
    }

    @Operation(
        summary = "Buscar e salvar mangás por título",
        description = "Busca mangás por título na API MangaDX e salva no banco local"
    )
    @PostMapping("/search-and-save")
    public ResponseEntity<Map<String, Object>> searchAndSaveMangas(
            @Parameter(description = "Título do manga para buscar", example = "Solo Leveling")
            @RequestParam 
            @NotBlank(message = "{population.title.required}")
            @Size(min = 2, max = 100, message = "{population.title.size}")
            String title,
            
            @Parameter(description = "Número máximo de resultados", example = "20")
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{population.limit.range}")
            @Max(value = 100, message = "{population.limit.range}")
            Integer limit,
            
            @Parameter(description = "Número de itens a pular", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{population.offset.positive}")
            Integer offset) {
        
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

    @Operation(
        summary = "Popular capítulos de um manga",
        description = "Popula todos os capítulos disponíveis de um manga específico"
    )
    @PostMapping("/chapters/{mangaId}")
    public ResponseEntity<Map<String, Object>> populateChaptersForManga(
            @Parameter(description = "ID único do manga no banco local", example = "123e4567-e89b-12d3-a456-426614174000")
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String mangaId) {
        
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

    @Operation(
        summary = "Popular autores",
        description = "Popula o banco de dados com autores da API MangaDX"
    )
    @PostMapping("/authors")
    public ResponseEntity<Map<String, Object>> populateAuthors(
            @Parameter(description = "Número máximo de autores para importar", example = "20")
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{population.limit.range}")
            @Max(value = 100, message = "{population.limit.range}")
            Integer limit,
            
            @Parameter(description = "Número de itens a pular", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{population.offset.positive}")
            Integer offset) {
        
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

    @Operation(
        summary = "Obter estatísticas do banco",
        description = "Retorna estatísticas atuais do banco de dados (total de mangás, autores e capítulos)"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Estatísticas obtidas com sucesso",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                      "totalMangas": 150,
                      "totalAuthors": 75,
                      "totalChapters": 2500
                    }
                    """
                )
            )
        )
    })
    @Tag(name = "📊 Estatísticas")
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

    @Operation(
        summary = "População completa",
        description = "Realiza uma população completa: mangás populares + seus capítulos"
    )
    @PostMapping("/complete-popular")
    public ResponseEntity<Map<String, Object>> populateCompletePopular(
            @Parameter(description = "Número máximo de mangás para importar (1-50)", example = "10")
            @RequestParam(defaultValue = "10") 
            @Min(value = 1, message = "{population.manga.limit.range}")
            @Max(value = 50, message = "{population.manga.limit.range}")
            Integer mangaLimit,
            
            @Parameter(description = "Número de itens a pular", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{population.offset.positive}")
            Integer offset,
            
            @Parameter(description = "Se deve incluir capítulos na população", example = "true")
            @RequestParam(defaultValue = "true") 
            @NotNull(message = "{population.include.chapters.required}")
            Boolean includeChapters) {
        
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