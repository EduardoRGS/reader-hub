package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Manga;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MangaResponseDto {
    
    private String id;
    private String apiId;
    private Map<String, String> title;
    private Map<String, String> description;
    private String status;
    private String year;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Integer views;
    private Integer follows;
    private Double rating;
    private Integer ratingCount;
    private AuthorResponseDto author;
    private Integer totalChapters;
    
    public static MangaResponseDto fromEntity(Manga manga) {
        if (manga == null) {
            return null;
        }
        
        MangaResponseDto dto = new MangaResponseDto();
        dto.setId(manga.getId());
        dto.setApiId(manga.getApiId());
        dto.setTitle(manga.getTitle());
        dto.setDescription(manga.getDescription());
        dto.setStatus(manga.getStatus());
        dto.setYear(manga.getYear());
        dto.setCreatedAt(manga.getCreatedAt());
        dto.setUpdatedAt(manga.getUpdatedAt());
        dto.setViews(manga.getViews());
        dto.setFollows(manga.getFollows());
        dto.setRating(manga.getRating());
        dto.setRatingCount(manga.getRatingCount());
        
        // Converter autor de forma segura
        if (manga.getAuthor() != null) {
            dto.setAuthor(AuthorResponseDto.fromEntity(manga.getAuthor()));
        }
        
        // Contar capítulos sem carregar a lista completa
        if (manga.getChapters() != null) {
            dto.setTotalChapters(manga.getChapters().size());
        } else {
            dto.setTotalChapters(0);
        }
        
        return dto;
    }
} 