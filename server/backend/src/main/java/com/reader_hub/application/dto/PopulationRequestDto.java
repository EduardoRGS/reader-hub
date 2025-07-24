package com.reader_hub.application.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * DTOs para validação de parâmetros de população
 */
public class PopulationRequestDto {

    /**
     * Parâmetros básicos de paginação
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationParams {
        
        @Min(value = 1, message = "{population.limit.range}")
        @Max(value = 100, message = "{population.limit.range}")
        private Integer limit = 20;
        
        @Min(value = 0, message = "{population.offset.positive}")
        private Integer offset = 0;
    }

    /**
     * Parâmetros para busca por título
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchParams extends PaginationParams {
        
        @NotBlank(message = "{population.title.required}")
        @Size(min = 2, max = 100, message = "{population.title.size}")
        private String title;
        
        public SearchParams(String title, Integer limit, Integer offset) {
            super(limit, offset);
            this.title = title;
        }
    }

    /**
     * Parâmetros para população completa
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletePopulationParams extends PaginationParams {
        
        @Min(value = 1, message = "{population.manga.limit.range}")
        @Max(value = 50, message = "{population.manga.limit.range}")
        private Integer mangaLimit = 10;
        
        @NotNull(message = "{population.include.chapters.required}")
        private Boolean includeChapters = true;
        
        public CompletePopulationParams(Integer mangaLimit, Integer offset, Boolean includeChapters) {
            super(mangaLimit, offset);
            this.mangaLimit = mangaLimit;
            this.includeChapters = includeChapters;
        }
    }

    /**
     * Parâmetros para filtros de capítulos
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterFilterParams {
        
        @Pattern(regexp = "^[a-z]{2}(-[a-z]{2})?$", 
                message = "{chapter.language.valid}")
        private String language;
        
        @Min(value = 1, message = "{population.limit.range}")
        @Max(value = 500, message = "Limite para capítulos deve ser no máximo 500")
        private Integer limit = 100;
        
        @Min(value = 0, message = "{population.offset.positive}")
        private Integer offset = 0;
    }
} 