package com.reader_hub.application.controller;

import com.reader_hub.application.dto.MangaDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.service.MangaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping
    public PaginatedDto<MangaDto> getMangas(@RequestParam Integer limit, @RequestParam Integer offset) {
        return apiService.getMangas(limit, offset);
    }

    @GetMapping("/{id}")
    public Optional<MangaDto> getMangaById(@PathVariable String id) {
        return apiService.getMangaById(id);
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