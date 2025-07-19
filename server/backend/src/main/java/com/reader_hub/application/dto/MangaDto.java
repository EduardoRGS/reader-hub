package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Relationchip;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
public class MangaDto {
    private String id;
    private String type;
    private ApiMangaAttributes attributes;
    private Relationchip[] relationships;

    @Data
    public static class ApiMangaAttributes {
        private Map<String, String> title;
        private List<Map<String, String>> altTitles;
        private Map<String, String> description;
        private String status;
        private String year;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private Integer views;
        private Integer follows;
        private Double rating;
        private Integer ratingCount;
    }
} 