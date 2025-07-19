package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Language;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class AuthorDto {
    private String id;
    private String type;
    private ApiAuthorAttributes attributes;
    
    @Data
    public static class ApiAuthorAttributes {
        private String name;
        private Language biography;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }
} 