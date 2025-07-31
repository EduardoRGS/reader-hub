package com.reader_hub.application.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoverResponseDto {
    private String result;
    private String response;
    private CoverDataDto data;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverDataDto {
        private String id;
        private String type;
        private CoverAttributesDto attributes;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverAttributesDto {
        private String description;
        private String volume;
        private String fileName;
        private String locale;
        private String createdAt;
        private String updatedAt;
        private Integer version;
    }
}