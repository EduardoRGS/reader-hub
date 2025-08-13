package com.reader_hub.application.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChapterDto {
    private String id;
    private String type;
    private ApiChapterAttributes attributes;
    private List<SimpleRelationship> relationships;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ApiChapterAttributes {
        private String title;
        private String volume;
        private String chapter;
        private Integer pages;
        private String translatedLanguage;
        private String uploader;
        private String externalUrl;
        private Integer version;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private OffsetDateTime publishAt;
        private OffsetDateTime readableAt;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SimpleRelationship {
        private String id;
        private String type;
        private Map<String, Object> attributes;
    }

        @Data
    public static class ChapterPagesDto {
        private String result;
        private String baseUrl;
        private ChapterData chapter;
        
        @Data
        public static class ChapterData {
            private String hash;
            private List<String> data;
            private List<String> dataSaver;
        }
    }
}