package com.reader_hub.application.dto;

import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Language;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorResponseDto {
    
    private String id;
    private String apiId;
    private String name;
    private Language biography;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Integer totalMangas;
    
    public static AuthorResponseDto fromEntity(Author author) {
        if (author == null) {
            return null;
        }
        
        AuthorResponseDto dto = new AuthorResponseDto();
        dto.setId(author.getId());
        dto.setApiId(author.getApiId());
        dto.setName(author.getName());
        dto.setBiography(author.getBiography());
        dto.setCreatedAt(author.getCreatedAt());
        dto.setUpdatedAt(author.getUpdatedAt());
        
        // Contar mangás sem carregar a lista completa
        if (author.getMangas() != null) {
            dto.setTotalMangas(author.getMangas().size());
        } else {
            dto.setTotalMangas(0);
        }
        
        return dto;
    }
    
    public static List<AuthorResponseDto> fromEntityList(List<Author> authors) {
        return authors.stream()
                .map(AuthorResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
} 