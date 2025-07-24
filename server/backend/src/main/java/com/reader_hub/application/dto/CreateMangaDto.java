package com.reader_hub.application.dto;

import com.reader_hub.application.validation.ValidMangaStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Map;

/**
 * DTO para criação manual de mangás com validações
 * Usado quando o usuário cria mangás diretamente, não via API externa
 */
@Data
public class CreateMangaDto {

    @NotBlank(message = "{manga.title.required}")
    @Size(min = 1, max = 255, message = "{manga.title.size}")
    private String title;

    @Size(max = 2000, message = "{common.description.size}")
    private String description;

    @NotNull(message = "{manga.status.required}")
    @ValidMangaStatus
    private String status;

    @Pattern(regexp = "^\\d{4}$", message = "{manga.year.pattern}")
    private String year;

    @Min(value = 0, message = "{common.views.positive}")
    private Integer views = 0;

    @Min(value = 0, message = "{common.follows.positive}")
    private Integer follows = 0;

    @DecimalMin(value = "0.0", message = "{manga.rating.range}")
    @DecimalMax(value = "10.0", message = "{manga.rating.range}")
    private Double rating;

    @Min(value = 0, message = "{common.ratingCount.positive}")
    private Integer ratingCount = 0;

    @Size(min = 1, message = "{common.author.id.required}")
    private String authorId;

    // Títulos multi-idioma opcionais
    private Map<String, String> titles;

    // Descrições multi-idioma opcionais
    private Map<String, String> descriptions;
} 