package com.reader_hub.application.dto;

import com.reader_hub.application.validation.ValidMangaStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Map;

/**
 * DTO para criação manual de mangás com validações
 * Usado quando o usuário cria mangás diretamente, não via API externa
 */
@Data
@Schema(
    description = "DTO para criação manual de mangás",
    example = """
    {
      "title": "Meu Manga Incrível",
      "description": "Uma história épica sobre aventuras em um mundo fantástico.",
      "status": "ongoing",
      "year": "2024",
      "views": 0,
      "follows": 0,
      "rating": 8.5,
      "ratingCount": 150,
      "authorId": "123e4567-e89b-12d3-a456-426614174000",
      "titles": {
        "pt-br": "Meu Manga Incrível",
        "en": "My Amazing Manga"
      },
      "descriptions": {
        "pt-br": "Uma história épica sobre aventuras.",
        "en": "An epic story about adventures."
      }
    }
    """
)
public class CreateMangaDto {

    @Schema(description = "Título principal do manga", example = "Solo Leveling", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "{manga.title.required}")
    @Size(min = 1, max = 255, message = "{manga.title.size}")
    private String title;

    @Schema(description = "Descrição/sinopse do manga", example = "Um caçador fraco se torna o mais forte")
    @Size(max = 2000, message = "{common.description.size}")
    private String description;

    @Schema(description = "Status de publicação do manga", example = "ongoing", allowableValues = {"ongoing", "completed", "hiatus", "cancelled"}, requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "{manga.status.required}")
    @ValidMangaStatus
    private String status;

    @Schema(description = "Ano de início da publicação", example = "2024", pattern = "^\\d{4}$")
    @Pattern(regexp = "^\\d{4}$", message = "{manga.year.pattern}")
    private String year;

    @Schema(description = "Número de visualizações", example = "1500", minimum = "0")
    @Min(value = 0, message = "{common.views.positive}")
    private Integer views = 0;

    @Schema(description = "Número de seguidores", example = "250", minimum = "0")
    @Min(value = 0, message = "{common.follows.positive}")
    private Integer follows = 0;

    @Schema(description = "Avaliação média (0.0 a 10.0)", example = "8.5", minimum = "0.0", maximum = "10.0")
    @DecimalMin(value = "0.0", message = "{manga.rating.range}")
    @DecimalMax(value = "10.0", message = "{manga.rating.range}")
    private Double rating;

    @Schema(description = "Número total de avaliações", example = "100", minimum = "0")
    @Min(value = 0, message = "{common.ratingCount.positive}")
    private Integer ratingCount = 0;

    @Schema(description = "ID do autor responsável pelo manga", example = "123e4567-e89b-12d3-a456-426614174000")
    @Size(min = 1, message = "{common.author.id.required}")
    private String authorId;

    @Schema(description = "Títulos em múltiplos idiomas", example = "{\"pt-br\": \"Solo Leveling\", \"en\": \"Solo Leveling\"}")
    private Map<String, String> titles;

    @Schema(description = "Descrições em múltiplos idiomas")
    private Map<String, String> descriptions;
} 