package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Manga;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(
    description = "DTO de resposta para mangás com informações completas",
    example = """
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "apiId": "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0",
      "title": {
        "pt-br": "Solo Leveling",
        "en": "Solo Leveling"
      },
      "description": {
        "pt-br": "Sung Jin-Woo é um caçador de rank E...",
        "en": "Sung Jin-Woo is an E-rank hunter..."
      },
      "status": "completed",
      "year": "2018",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "views": 50000,
      "follows": 15000,
      "rating": 9.2,
      "ratingCount": 5000,
      "totalChapters": 179,
      "author": {
        "id": "author-123",
        "name": "h-goon",
        "totalMangas": 1
      }
    }
    """
)
public class MangaResponseDto {
    
    @Schema(description = "ID único do manga no sistema", example = "123e4567-e89b-12d3-a456-426614174000")
    private String id;
    
    @Schema(description = "ID do manga na API externa (MangaDX)", example = "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0")
    private String apiId;
    
    @Schema(description = "Títulos do manga em múltiplos idiomas")
    private Map<String, String> title;
    
    @Schema(description = "Descrições do manga em múltiplos idiomas")
    private Map<String, String> description;
    
    @Schema(description = "Status de publicação", example = "completed", allowableValues = {"ongoing", "completed", "hiatus", "cancelled"})
    private String status;
    
    @Schema(description = "Ano de início da publicação", example = "2018")
    private String year;
    
    @Schema(description = "Data de criação no sistema", example = "2024-01-15T10:30:00Z")
    private OffsetDateTime createdAt;
    
    @Schema(description = "Data da última atualização", example = "2024-01-15T10:30:00Z")
    private OffsetDateTime updatedAt;
    
    @Schema(description = "Número total de visualizações", example = "50000")
    private Integer views;
    
    @Schema(description = "Número total de seguidores", example = "15000")
    private Integer follows;
    
    @Schema(description = "Avaliação média (0.0 a 10.0)", example = "9.2")
    private Double rating;
    
    @Schema(description = "Número total de avaliações", example = "5000")
    private Integer ratingCount;
    
    @Schema(description = "Informações do autor")
    private AuthorResponseDto author;
    
    @Schema(description = "Número total de capítulos disponíveis", example = "179")
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