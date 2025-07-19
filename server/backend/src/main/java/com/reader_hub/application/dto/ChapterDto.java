package com.reader_hub.application.dto;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class ChapterDto {
    private String id;
    private String type;
    private ChapterData chapter;
    private ApiChapterAttributes attributes;


    @Data
    public static class ChapterData {
        private List<String> data; // images
    }
    
    @Data
    public static class ApiChapterAttributes {
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
    }
} 