package com.reader_hub.application.controller;

import com.reader_hub.application.dto.*;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Manga;
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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/manga")
@RequiredArgsConstructor
@Validated
@Tag(name = "📚 Mangás", description = "Operações relacionadas aos mangás")
public class MangaController {

    private final ApiService apiService;
    private final MangaService mangaService;

    // ================== ENDPOINTS DA API EXTERNA (MangaDx) ==================

    @Operation(
        summary = "Buscar mangás da API externa", 
        description = "Obtém uma lista paginada de mangás diretamente da API MangaDX"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de mangás obtida com sucesso"),
        @ApiResponse(responseCode = "400", description = "Parâmetros inválidos"),
        @ApiResponse(responseCode = "502", description = "Erro de comunicação com API externa")
    })
    @Tag(name = "🌐 API Externa")
    @GetMapping("/external")
    public PaginatedDto<ExternalMangaDto> getExternalMangas(
            @Parameter(description = "Número máximo de resultados", example = "20")
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @Parameter(description = "Número de itens a pular", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        return apiService.getMangas(limit, offset);
    }

    @Operation(
        summary = "Buscar manga específico da API externa",
        description = "Obtém os detalhes de um manga específico da API MangaDX pelo ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Manga encontrado"),
        @ApiResponse(responseCode = "404", description = "Manga não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    @Tag(name = "🌐 API Externa")
    @GetMapping("/external/{id}")
    public Optional<ExternalMangaDto> getExternalMangaById(
            @Parameter(description = "ID único do manga na API MangaDX", example = "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0")
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String id) {
        return apiService.getMangaById(id);
    }

    // ================== ENDPOINTS DO BANCO LOCAL ==================

    @Operation(
        summary = "Listar mangás do banco local",
        description = "Obtém uma lista paginada de mangás armazenados no banco de dados local"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Lista de mangás obtida com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = PaginatedResponseDto.class),
                examples = @ExampleObject(
                    name = "Resposta de exemplo",
                    value = """
                    {
                      "content": [
                        {
                          "id": "123e4567-e89b-12d3-a456-426614174000",
                          "title": {"pt-br": "Solo Leveling", "en": "Solo Leveling"},
                          "status": "completed",
                          "year": "2018",
                          "rating": 9.5,
                          "totalChapters": 179
                        }
                      ],
                      "totalElements": 1,
                      "totalPages": 1,
                      "size": 20,
                      "number": 0
                    }
                    """
                )
            )
        ),
        @ApiResponse(responseCode = "400", description = "Parâmetros inválidos")
    })
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<MangaResponseDto>> getLocalMangas(
            @Parameter(description = "Número máximo de resultados por página", example = "20")
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @Parameter(description = "Número de itens a pular para paginação", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        Page<Manga> mangas = mangaService.findAll(PageRequest.of(offset / limit, limit));
        
        PaginatedResponseDto<MangaResponseDto> response = PaginatedResponseDto.fromPage(
            mangas, MangaResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Buscar manga por ID",
        description = "Obtém os detalhes de um manga específico do banco local"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Manga encontrado"),
        @ApiResponse(responseCode = "404", description = "Manga não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    @GetMapping("/local/{id}")
    public ResponseEntity<MangaResponseDto> getLocalMangaById(
            @Parameter(description = "ID único do manga no banco local", example = "123e4567-e89b-12d3-a456-426614174000")
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String id) {
        Optional<Manga> manga = mangaService.findById(id);
        if (manga.isPresent()) {
            return ResponseEntity.ok(MangaResponseDto.fromEntity(manga.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(
        summary = "Buscar manga com autor",
        description = "Obtém os detalhes de um manga com as informações completas do autor"
    )
    @GetMapping("/local/with-author/{id}")
    public ResponseEntity<MangaResponseDto> getLocalMangaWithAuthor(
            @Parameter(description = "ID único do manga", example = "123e4567-e89b-12d3-a456-426614174000")
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String id) {
        Optional<Manga> manga = mangaService.findByIdWithAuthor(id);
        if (manga.isPresent()) {
            return ResponseEntity.ok(MangaResponseDto.fromEntity(manga.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(
        summary = "Deletar múltiplos mangás em lote",
        description = "Remove múltiplos mangás do banco local junto com todos os seus capítulos associados (cascade)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Mangás deletados com sucesso"),
        @ApiResponse(responseCode = "400", description = "Lista de IDs inválida")
    })
    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deleteMangasBatch(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Lista de IDs dos mangás a serem deletados"
            )
            @RequestBody List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lista de IDs não pode ser vazia"));
        }
        int deleted = mangaService.deleteByIds(ids);
        return ResponseEntity.ok(Map.of(
            "deleted", deleted,
            "requested", ids.size()
        ));
    }

    // ================== ENDPOINTS DE CRIAÇÃO ==================

    @Operation(
        summary = "Criar manga via API externa",
        description = "Cria um novo manga no banco local usando dados da API MangaDX"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Manga criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Manga já existe")
    })
    @PostMapping("/from-api")
    public ResponseEntity<MangaResponseDto> createMangaFromApi(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Dados do manga obtidos da API MangaDX",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ExternalMangaDto.class)
                )
            )
            @Valid @RequestBody ExternalMangaDto externalMangaDto) {
        Manga manga = mangaService.createManga(externalMangaDto);
        return ResponseEntity.ok(MangaResponseDto.fromEntity(manga));
    }

    @Operation(
        summary = "Criar manga manualmente",
        description = "Cria um novo manga no banco local com dados fornecidos pelo usuário"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Manga criado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou faltantes"),
        @ApiResponse(responseCode = "404", description = "Autor não encontrado")
    })
    @PostMapping("/manual")
    public ResponseEntity<MangaResponseDto> createMangaManual(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Dados para criação manual do manga",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = CreateMangaDto.class),
                    examples = @ExampleObject(
                        name = "Exemplo de criação",
                        value = """
                        {
                          "title": "Meu Manga Incrível",
                          "description": "Uma história épica sobre aventuras.",
                          "status": "ongoing",
                          "year": "2024",
                          "authorId": "123e4567-e89b-12d3-a456-426614174000"
                        }
                        """
                    )
                )
            )
            @Valid @RequestBody CreateMangaDto createMangaDto) {
        Manga manga = mangaService.createMangaManual(createMangaDto);
        return ResponseEntity.ok(MangaResponseDto.fromEntity(manga));
    }

    // ================== ENDPOINT DE REMOÇÃO ==================

    @Operation(
        summary = "Deletar manga e seus capítulos",
        description = "Remove um manga do banco local junto com todos os seus capítulos associados (cascade)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Manga deletado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Manga não encontrado"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManga(
            @Parameter(description = "ID único do manga no banco local", 
                       example = "123e4567-e89b-12d3-a456-426614174000")
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String id) {
        mangaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ================== ENDPOINTS DE CAPAS ==================

    @Operation(
        summary = "Buscar capa do manga",
        description = "Obtém a URL da capa de um manga específico da API MangaDX"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "URL da capa obtida com sucesso"),
        @ApiResponse(responseCode = "404", description = "Capa não encontrada"),
        @ApiResponse(responseCode = "400", description = "ID inválido")
    })
    @Tag(name = "🖼️ Capas")
    @GetMapping("/external/{id}/cover")
    public ResponseEntity<Map<String, String>> getMangaCover(
            @Parameter(description = "ID único do manga na API MangaDEX",
                    example = "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0")
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String id) {
        
        try {
            String coverUrl = apiService.getMangaCoverUrl(id);
            if (coverUrl != null) {
                return ResponseEntity.ok(Map.of("coverUrl", coverUrl));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ================== ENDPOINTS DE BUSCA E FILTROS ==================

    @Operation(
        summary = "Buscar mangás por título",
        description = "Pesquisa mangás no banco local por título (multilíngue). " +
                      "Suporta busca em pt-br, en e outros idiomas."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Resultados da busca"),
        @ApiResponse(responseCode = "400", description = "Parâmetros inválidos")
    })
    @GetMapping("/search")
    public ResponseEntity<PaginatedResponseDto<MangaResponseDto>> searchMangas(
            @Parameter(description = "Termo de busca", example = "Naruto")
            @RequestParam
            @NotBlank(message = "Termo de busca é obrigatório")
            String q,

            @Parameter(description = "Status para filtrar (opcional)", example = "ongoing",
                    schema = @Schema(allowableValues = {"ongoing", "completed", "hiatus", "cancelled"}))
            @RequestParam(required = false)
            String status,

            @Parameter(description = "Número máximo de resultados por página", example = "20")
            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,

            @Parameter(description = "Número de itens a pular", example = "0")
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {

        Page<Manga> mangas = mangaService.searchByTitleSimple(
                q.trim(), PageRequest.of(offset / limit, limit));

        // Se status foi informado, filtrar
        if (status != null && !status.isBlank()) {
            List<Manga> filtered = mangas.getContent().stream()
                    .filter(m -> status.equalsIgnoreCase(m.getStatus()))
                    .toList();
            PaginatedResponseDto<MangaResponseDto> response =
                    PaginatedResponseDto.fromList(
                            filtered.stream().map(MangaResponseDto::fromEntity).toList(),
                            filtered.size(),
                            offset / limit,
                            limit
                    );
            return ResponseEntity.ok(response);
        }

        PaginatedResponseDto<MangaResponseDto> response = PaginatedResponseDto.fromPage(
                mangas, MangaResponseDto::fromEntity
        );

        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Filtrar mangás por status",
        description = "Obtém mangás filtrados por status (ongoing, completed, hiatus, cancelled)"
    )
    @GetMapping("/by-status/{status}")
    public ResponseEntity<PaginatedResponseDto<MangaResponseDto>> getMangasByStatus(
            @Parameter(description = "Status do manga", example = "ongoing", schema = @Schema(allowableValues = {"ongoing", "completed", "hiatus", "cancelled"}))
            @PathVariable 
            @NotBlank(message = "{common.status.required}")
            String status,
            
            @Parameter(description = "Número máximo de resultados", example = "20")
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @Parameter(description = "Número de itens a pular", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        Page<Manga> mangas = mangaService.findByStatus(status, PageRequest.of(offset / limit, limit));
        
        PaginatedResponseDto<MangaResponseDto> response = PaginatedResponseDto.fromPage(
            mangas, MangaResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Filtrar mangás por ano",
        description = "Obtém mangás filtrados por ano de publicação"
    )
    @GetMapping("/by-year/{year}")
    public ResponseEntity<PaginatedResponseDto<MangaResponseDto>> getMangasByYear(
            @Parameter(description = "Ano de publicação", example = "2024")
            @PathVariable 
            @NotBlank(message = "{common.year.required}")
            String year,
            
            @Parameter(description = "Número máximo de resultados", example = "20")
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @Parameter(description = "Número de itens a pular", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        Page<Manga> mangas = mangaService.findByYear(year, PageRequest.of(offset / limit, limit));
        
        PaginatedResponseDto<MangaResponseDto> response = PaginatedResponseDto.fromPage(
            mangas, MangaResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }
}