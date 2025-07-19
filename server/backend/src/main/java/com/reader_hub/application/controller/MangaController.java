package com.reader_hub.application.controller;

import com.reader_hub.application.dto.MangaDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.ports.ApiService;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/manga")
public class MangaController {

    private final ApiService apiService;

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

} 