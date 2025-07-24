package com.reader_hub.application.controller;

import com.reader_hub.application.dto.ChapterDto;
import com.reader_hub.application.dto.ChapterResponseDto;
import com.reader_hub.application.dto.PaginatedResponseDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Chapter;
import com.reader_hub.domain.service.ChapterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chapter")
public class ChapterController {

    private final ApiService apiService;
    private ChapterService chapterService;

    public ChapterController(ApiService apiService) {
        this.apiService = apiService;
    }

    // Endpoints da API Externa (MangaDx)
    @GetMapping("/external/{id}")
    public Optional<ChapterDto> getExternalChapterById(@PathVariable String id) {
        return apiService.getChapterById(id);
    }

    @GetMapping("/external/manga/{mangaId}")
    public List<ChapterDto> getExternalChaptersByMangaId(@PathVariable String mangaId,
                                                         @RequestParam(defaultValue = "500") Integer limit,
                                                         @RequestParam(defaultValue = "0") Integer offset) {
        return apiService.getChaptersByMangaId(mangaId, limit, offset);
    }

    @GetMapping("/external/{chapterId}/pages")
    public List<String> getExternalChapterPages(@PathVariable String chapterId) {
        return apiService.getChapterPages(chapterId);
    }

    // Endpoints do Banco Local - retornando DTOs
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<ChapterResponseDto>> getLocalChapters(
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {
        Page<Chapter> chapters = chapterService.findAll(PageRequest.of(offset / limit, limit));
        
        // Usar o novo DTO padronizado com transformação
        PaginatedResponseDto<ChapterResponseDto> response = PaginatedResponseDto.fromPage(
            chapters, ChapterResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/local/{id}")
    public ResponseEntity<ChapterResponseDto> getLocalChapterById(@PathVariable String id) {
        Optional<Chapter> chapter = chapterService.findById(id);
        if (chapter.isPresent()) {
            return ResponseEntity.ok(ChapterResponseDto.fromEntity(chapter.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/local/manga/{mangaId}")
    public List<ChapterResponseDto> getLocalChaptersByMangaId(@PathVariable String mangaId,
                                                              @RequestParam(required = false) String language) {
        List<Chapter> chapters;
        if (language != null) {
            chapters = chapterService.findByMangaIdAndLanguage(mangaId, language);
        } else {
            chapters = chapterService.findByMangaId(mangaId);
        }
        return ChapterResponseDto.fromEntityList(chapters);
    }

    @GetMapping("/local/{id}/with-pages")
    public ResponseEntity<ChapterResponseDto> getLocalChapterWithPages(@PathVariable String id) {
        Optional<Chapter> chapter = chapterService.findByIdWithImages(id);
        if (chapter.isPresent()) {
            return ResponseEntity.ok(ChapterResponseDto.fromEntity(chapter.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/latest")
    public ResponseEntity<PaginatedResponseDto<ChapterResponseDto>> getLatestChapters(
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {
        Page<Chapter> chapters = chapterService.findLatestChapters(PageRequest.of(offset / limit, limit));
        
        // Usar o novo DTO padronizado com transformação
        PaginatedResponseDto<ChapterResponseDto> response = PaginatedResponseDto.fromPage(
            chapters, ChapterResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/local/{id}/view")
    public ResponseEntity<ChapterResponseDto> incrementViews(@PathVariable String id) {
        try {
            Chapter chapter = chapterService.incrementViews(id);
            return ResponseEntity.ok(ChapterResponseDto.fromEntity(chapter));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Autowired
    public void setChapterService(ChapterService chapterService) {
        this.chapterService = chapterService;
    }
} 