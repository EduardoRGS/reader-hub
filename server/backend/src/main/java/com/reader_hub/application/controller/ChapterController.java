package com.reader_hub.application.controller;

import com.reader_hub.application.dto.ChapterDto;
import com.reader_hub.application.ports.ApiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chapter")
public class ChapterController {

    private final ApiService apiService;

    public ChapterController(ApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping("/{id}")
    public Optional<ChapterDto> getChapterById(@PathVariable String id) {
        return apiService.getChapterById(id);
    }

    @GetMapping("/manga/{mangaId}")
    public List<ChapterDto> getChaptersByMangaId(@PathVariable String mangaId,
                                                 @RequestParam(required = false) Integer limit,
                                                 @RequestParam(required = false) Integer offset) {
        return apiService.getChaptersByMangaId(mangaId, limit, offset);
    }

    @GetMapping("/{chapterId}/pages")
    public List<String> getChapterPages(@PathVariable String chapterId) {
        return apiService.getChapterPages(chapterId);
    }

} 