package com.reader_hub.application.controller;

import com.reader_hub.application.dto.MangaDto;
import com.reader_hub.application.dto.MangaResponseDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.dto.PaginatedResponseDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.service.MangaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/manga")
public class MangaController {

    private final ApiService apiService;
    private MangaService mangaService;

    public MangaController(ApiService apiService) {
        this.apiService = apiService;
    }

    // Endpoints da API Externa (MangaDx)
    @GetMapping("/external")
    public PaginatedDto<MangaDto> getExternalMangas(
            @RequestParam(defaultValue = "20") Integer limit, 
            @RequestParam(defaultValue = "0") Integer offset) {
        return apiService.getMangas(limit, offset);
    }

    @GetMapping("/external/{id}")
    public Optional<MangaDto> getExternalMangaById(@PathVariable String id) {
        return apiService.getMangaById(id);
    }

    // Endpoints do Banco Local - agora retornando DTOs
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<MangaResponseDto>> getLocalMangas(
            @RequestParam(defaultValue = "20") Integer limit, 
            @RequestParam(defaultValue = "0") Integer offset) {
        Page<Manga> mangas = mangaService.findAll(PageRequest.of(offset / limit, limit));
        
        // Usar o novo DTO padronizado com transformação
        PaginatedResponseDto<MangaResponseDto> response = PaginatedResponseDto.fromPage(
            mangas, MangaResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/local/{id}")
    public ResponseEntity<MangaResponseDto> getLocalMangaById(@PathVariable String id) {
        Optional<Manga> manga = mangaService.findById(id);
        if (manga.isPresent()) {
            return ResponseEntity.ok(MangaResponseDto.fromEntity(manga.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/local/with-author/{id}")
    public ResponseEntity<MangaResponseDto> getLocalMangaWithAuthor(@PathVariable String id) {
        Optional<Manga> manga = mangaService.findByIdWithAuthor(id);
        if (manga.isPresent()) {
            return ResponseEntity.ok(MangaResponseDto.fromEntity(manga.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Manga> createManga(@Valid @RequestBody MangaDto mangaDto) {
        var manga = mangaService.createManga(mangaDto);
        return ResponseEntity.ok(manga);
    }

    @Autowired
    public void setMangaService(MangaService mangaService) {
        this.mangaService = mangaService;
    }
}