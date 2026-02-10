package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Chapter;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterResponseDto {
    
    private String id;
    private String apiId;
    private String title;
    private String volume;
    private String chapter;
    private Integer pages;
    private String status;
    private String language;
    private OffsetDateTime publishedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime readableAt;
    private Integer views;
    private Integer comments;
    private List<String> imageUrls; // URLs das páginas
    private String mangaId;
    private String mangaTitle;
    
    public static ChapterResponseDto fromEntity(Chapter chapter) {
        if (chapter == null) {
            return null;
        }
        
        ChapterResponseDto dto = new ChapterResponseDto();
        dto.setId(chapter.getId());
        dto.setApiId(chapter.getApiId());
        dto.setTitle(chapter.getTitle());
        dto.setVolume(chapter.getVolume());
        dto.setChapter(chapter.getChapter());
        dto.setPages(chapter.getPages());
        dto.setStatus(chapter.getStatus());
        dto.setLanguage(chapter.getLanguage());
        dto.setPublishedAt(chapter.getPublishedAt());
        dto.setCreatedAt(chapter.getCreatedAt());
        dto.setUpdatedAt(chapter.getUpdatedAt());
        dto.setReadableAt(chapter.getReadableAt());
        dto.setViews(chapter.getViews());
        dto.setComments(chapter.getComments());
        dto.setImageUrls(chapter.getImages()); // URLs das páginas
        
        // Dados do manga de forma segura
        if (chapter.getManga() != null) {
            dto.setMangaId(chapter.getManga().getId());
            if (chapter.getManga().getTitle() != null) {
                // Pegar título em português ou inglês
                String title = chapter.getManga().getTitle().get("pt-br");
                if (title == null) {
                    title = chapter.getManga().getTitle().get("en");
                }
                dto.setMangaTitle(title);
            }
        }
        
        return dto;
    }
    
    /**
     * Converte entidade para DTO SEM carregar imagens.
     * Evita N+1 queries quando listando muitos capítulos,
     * já que @ElementCollection(images) é lazy-loaded.
     */
    public static ChapterResponseDto fromEntityLight(Chapter chapter) {
        if (chapter == null) {
            return null;
        }
        
        ChapterResponseDto dto = new ChapterResponseDto();
        dto.setId(chapter.getId());
        dto.setApiId(chapter.getApiId());
        dto.setTitle(chapter.getTitle());
        dto.setVolume(chapter.getVolume());
        dto.setChapter(chapter.getChapter());
        dto.setPages(chapter.getPages());
        dto.setStatus(chapter.getStatus());
        dto.setLanguage(chapter.getLanguage());
        dto.setPublishedAt(chapter.getPublishedAt());
        dto.setCreatedAt(chapter.getCreatedAt());
        dto.setUpdatedAt(chapter.getUpdatedAt());
        dto.setReadableAt(chapter.getReadableAt());
        dto.setViews(chapter.getViews());
        dto.setComments(chapter.getComments());
        // imageUrls intencionalmente NÃO carregadas — usar /with-pages para isso
        
        if (chapter.getManga() != null) {
            dto.setMangaId(chapter.getManga().getId());
            if (chapter.getManga().getTitle() != null) {
                String title = chapter.getManga().getTitle().get("pt-br");
                if (title == null) {
                    title = chapter.getManga().getTitle().get("en");
                }
                dto.setMangaTitle(title);
            }
        }
        
        return dto;
    }

    public static List<ChapterResponseDto> fromEntityList(List<Chapter> chapters) {
        return chapters.stream()
                .map(ChapterResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public static List<ChapterResponseDto> fromEntityListLight(List<Chapter> chapters) {
        return chapters.stream()
                .map(ChapterResponseDto::fromEntityLight)
                .collect(Collectors.toList());
    }
} 