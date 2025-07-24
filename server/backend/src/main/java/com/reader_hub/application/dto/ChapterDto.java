package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Relationship;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class ChapterDto {
    private String id;
    private String type;
    private ApiChapterAttributes attributes;
    private List<Relationship> relationships;

    @Data
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

    // DTO para resposta do endpoint at-home/server
    @Data
    public static class ChapterPagesDto {
        private String result;
        private String baseUrl;
        private ChapterData chapter;
        
        @Data
        public static class ChapterData {
            private String hash;
            private List<String> data; // nomes dos arquivos de imagem
            private List<String> dataSaver; // versão comprimida
        }
    }
} 