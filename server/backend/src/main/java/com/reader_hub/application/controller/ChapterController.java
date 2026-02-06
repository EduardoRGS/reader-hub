package com.reader_hub.application.controller;

import com.reader_hub.application.dto.ChapterDto;
import com.reader_hub.application.dto.ChapterResponseDto;
import com.reader_hub.application.dto.PaginatedResponseDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Chapter;
import com.reader_hub.domain.service.ChapterService;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/chapter")
@RequiredArgsConstructor
@Validated
public class ChapterController {

    private final ApiService apiService;
    private final ChapterService chapterService;

    // ================== ENDPOINTS DA API EXTERNA (MangaDx) ==================
    
    @GetMapping("/external/{id}")
    public Optional<ChapterDto> getExternalChapterById(
            @PathVariable 
            @NotBlank(message = "ID do capítulo é obrigatório")
            String id) {
        return apiService.getChapterById(id);
    }

    @GetMapping("/external/manga/{mangaId}")
    public List<ChapterDto> getExternalChaptersByMangaId(
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String mangaId,
            
            @RequestParam(defaultValue = "500") 
            @Min(value = 1, message = "Limite deve ser entre 1 e 1000")
            @Max(value = 1000, message = "Limite deve ser entre 1 e 1000")
            Integer limit,
            
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        return apiService.getChaptersByMangaId(mangaId, limit, offset);
    }

    @GetMapping("/external/{chapterId}/pages")
    public List<String> getExternalChapterPages(
            @PathVariable 
            @NotBlank(message = "ID do capítulo é obrigatório")
            String chapterId) {
        return apiService.getChapterPages(chapterId);
    }

    // ================== ENDPOINTS DO BANCO LOCAL ==================
    
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<ChapterResponseDto>> getLocalChapters(
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        Page<Chapter> chapters = chapterService.findAll(PageRequest.of(offset / limit, limit));
        
        // Usar o novo DTO padronizado com transformação
        PaginatedResponseDto<ChapterResponseDto> response = PaginatedResponseDto.fromPage(
            chapters, ChapterResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/local/{id}")
    public ResponseEntity<ChapterResponseDto> getLocalChapterById(
            @PathVariable 
            @NotBlank(message = "ID do capítulo é obrigatório")
            String id) {
        Optional<Chapter> chapter = chapterService.findById(id);
        if (chapter.isPresent()) {
            return ResponseEntity.ok(ChapterResponseDto.fromEntity(chapter.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/local/manga/{mangaId}")
    public List<ChapterResponseDto> getLocalChaptersByMangaId(
            @PathVariable 
            @NotBlank(message = "{manga.id.required}")
            String mangaId,
            
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
    public ResponseEntity<ChapterResponseDto> getLocalChapterWithPages(
            @PathVariable 
            @NotBlank(message = "ID do capítulo é obrigatório")
            String id) {
        Optional<Chapter> chapter = chapterService.findByIdWithImages(id);
        if (chapter.isPresent()) {
            return ResponseEntity.ok(ChapterResponseDto.fromEntity(chapter.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/latest")
    public ResponseEntity<PaginatedResponseDto<ChapterResponseDto>> getLatestChapters(
            @RequestParam(defaultValue = "10") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit,
            
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        Page<Chapter> chapters = chapterService.findLatestChapters(PageRequest.of(offset / limit, limit));
        
        // Usar o novo DTO padronizado com transformação
        PaginatedResponseDto<ChapterResponseDto> response = PaginatedResponseDto.fromPage(
            chapters, ChapterResponseDto::fromEntity
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/local/{id}/view")
    public ResponseEntity<ChapterResponseDto> incrementViews(
            @PathVariable 
            @NotBlank(message = "ID do capítulo é obrigatório")
            String id) {
        Chapter chapter = chapterService.incrementViews(id);
        return ResponseEntity.ok(ChapterResponseDto.fromEntity(chapter));
    }
} 