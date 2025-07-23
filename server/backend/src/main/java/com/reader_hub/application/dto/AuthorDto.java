package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Language;
import com.reader_hub.domain.model.Relationship;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
public class AuthorDto {
    private String id;
    private String type;
    private ApiAuthorAttributes attributes;
    private Relationship[] relationships;
    
    @Data
    public static class ApiAuthorAttributes {
        private String name;
        private Language biography;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
    }

    public static Author toEntity(AuthorDto dto, String dbAuthorId) {
        if (dto == null || dto.getAttributes() == null) {
            return null;
        }

        Author author = new Author();
        author.setId(dbAuthorId);
        author.setName(dto.getAttributes().getName());
        author.setBiography(dto.getAttributes().getBiography());
        author.setCreatedAt(dto.getAttributes().getCreatedAt());
        author.setUpdatedAt(dto.getAttributes().getUpdatedAt());

        // Não setamos mangas porque essa relação é geralmente tratada separadamente

        return author;
    }
}