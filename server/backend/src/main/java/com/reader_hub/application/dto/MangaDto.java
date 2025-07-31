package com.reader_hub.application.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MangaDto {
    private String id;
    private String type;
    private ApiMangaAttributes attributes;
    
    // Simplificar relationships para apenas capturar id e type
    @JsonIgnoreProperties(ignoreUnknown = true)
    private List<SimpleRelationship> relationships;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ApiMangaAttributes {
        private Map<String, String> title;
        
        @JsonProperty("altTitles")
        private List<Map<String, String>> altTitles;
        
        private Map<String, String> description;
        private String status;
        private String year;
        
        @JsonProperty("originalLanguage")
        private String originalLanguage;
        
        @JsonProperty("lastVolume")
        private String lastVolume;
        
        @JsonProperty("lastChapter")
        private String lastChapter;
        
        @JsonProperty("publicationDemographic")
        private String publicationDemographic;
        
        private String state;
        
        @JsonProperty("chapterNumbersResetOnNewVolume")
        private Boolean chapterNumbersResetOnNewVolume;
        
        @JsonProperty("createdAt")
        private OffsetDateTime createdAt;
        
        @JsonProperty("updatedAt")
        private OffsetDateTime updatedAt;
        
        private Integer version;
        private Map<String, String> links;
        
        @JsonProperty("availableTranslatedLanguages")
        private List<String> availableTranslatedLanguages;
        
        @JsonProperty("latestUploadedChapter")
        private String latestUploadedChapter;
    }
    
    // Classe simplificada para relacionamentos
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SimpleRelationship {
        private String id;
        private String type;
        private Map<String, String> attributes;
    }
} 