package com.reader_hub.application.controller;

import com.reader_hub.application.dto.CreateMangaDto;
import com.reader_hub.application.dto.MangaDto;
import com.reader_hub.application.dto.MangaResponseDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.dto.PaginatedResponseDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.service.MangaService;
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

import java.util.Optional;

@RestController
@RequestMapping("/api/manga")
@RequiredArgsConstructor
@Validated
public class MangaController {

    private final ApiService apiService;
    private final MangaService mangaService;

    // ================== ENDPOINTS DA API EXTERNA (MangaDx) ==================

    @GetMapping("/external")
    public PaginatedDto<MangaDto> getExternalMangas(
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        return apiService.getMangas(limit, offset);
    }

    @GetMapping("/external/{id}")
    public Optional<MangaDto> getExternalMangaById(
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String id) {
        return apiService.getMangaById(id);
    }

    // ================== ENDPOINTS DO BANCO LOCAL ==================

    @GetMapping
    public ResponseEntity<PaginatedResponseDto<MangaResponseDto>> getLocalMangas(
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        Page<Manga> mangas = mangaService.findAll(PageRequest.of(offset / limit, limit));
        
        // Usar o novo DTO padronizado com transformação
        PaginatedResponseDto<MangaResponseDto> response = PaginatedResponseDto.fromPage(
            mangas, MangaResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/local/{id}")
    public ResponseEntity<MangaResponseDto> getLocalMangaById(
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String id) {
        Optional<Manga> manga = mangaService.findById(id);
        if (manga.isPresent()) {
            return ResponseEntity.ok(MangaResponseDto.fromEntity(manga.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/local/with-author/{id}")
    public ResponseEntity<MangaResponseDto> getLocalMangaWithAuthor(
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String id) {
        Optional<Manga> manga = mangaService.findByIdWithAuthor(id);
        if (manga.isPresent()) {
            return ResponseEntity.ok(MangaResponseDto.fromEntity(manga.get()));
        }
        return ResponseEntity.notFound().build();
    }

    // ================== ENDPOINTS DE CRIAÇÃO ==================

    /**
     * Criar manga via API externa (usando MangaDto da API)
     */
    @PostMapping("/from-api")
    public ResponseEntity<MangaResponseDto> createMangaFromApi(
            @Valid @RequestBody MangaDto mangaDto) {
        Manga manga = mangaService.createManga(mangaDto);
        return ResponseEntity.ok(MangaResponseDto.fromEntity(manga));
    }

    /**
     * Criar manga manualmente (usando CreateMangaDto com validações)
     */
    @PostMapping("/manual")
    public ResponseEntity<MangaResponseDto> createMangaManual(
            @Valid @RequestBody CreateMangaDto createMangaDto) {
        Manga manga = mangaService.createMangaManual(createMangaDto);
        return ResponseEntity.ok(MangaResponseDto.fromEntity(manga));
    }

    // ================== ENDPOINTS DE BUSCA E FILTROS ==================

    /**
     * Busca temporariamente desabilitada devido a problemas com query HQL
     * TODO: Implementar busca robusta
     */
    /*
    @GetMapping("/search")
    public ResponseEntity<PaginatedResponseDto<MangaResponseDto>> searchMangas(
            @RequestParam 
            @NotBlank(message = "{common.search.term.required}")
            String query,
            
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        
        Page<Manga> mangas = mangaService.searchMangasByTitle(query, PageRequest.of(offset / limit, limit));
        
        PaginatedResponseDto<MangaResponseDto> response = PaginatedResponseDto.fromPage(
            mangas, MangaResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }
    */

    @GetMapping("/by-status/{status}")
    public ResponseEntity<PaginatedResponseDto<MangaResponseDto>> getMangasByStatus(
            @PathVariable 
            @NotBlank(message = "{common.status.required}")
            String status,
            
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        
        Page<Manga> mangas = mangaService.findByStatus(status, PageRequest.of(offset / limit, limit));
        
        PaginatedResponseDto<MangaResponseDto> response = PaginatedResponseDto.fromPage(
            mangas, MangaResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-year/{year}")
    public ResponseEntity<PaginatedResponseDto<MangaResponseDto>> getMangasByYear(
            @PathVariable 
            @NotBlank(message = "{common.year.required}")
            String year,
            
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
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