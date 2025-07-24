package com.reader_hub.application.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResponseDto<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int size;
    private int number;
    private boolean first;
    private boolean last;
    private boolean empty;
    
    /**
     * Converte um Page do Spring Data para PaginatedResponseDto
     */
    public static <T> PaginatedResponseDto<T> fromPage(Page<T> page) {
        PaginatedResponseDto<T> dto = new PaginatedResponseDto<>();
        dto.setContent(page.getContent());
        dto.setTotalElements(page.getTotalElements());
        dto.setTotalPages(page.getTotalPages());
        dto.setSize(page.getSize());
        dto.setNumber(page.getNumber());
        dto.setFirst(page.isFirst());
        dto.setLast(page.isLast());
        dto.setEmpty(page.isEmpty());
        return dto;
    }
    
    /**
     * Converte um Page do Spring Data para PaginatedResponseDto com transformação
     */
    public static <T, R> PaginatedResponseDto<R> fromPage(Page<T> page, Function<T, R> mapper) {
        PaginatedResponseDto<R> dto = new PaginatedResponseDto<>();
        dto.setContent(page.getContent().stream().map(mapper).toList());
        dto.setTotalElements(page.getTotalElements());
        dto.setTotalPages(page.getTotalPages());
        dto.setSize(page.getSize());
        dto.setNumber(page.getNumber());
        dto.setFirst(page.isFirst());
        dto.setLast(page.isLast());
        dto.setEmpty(page.isEmpty());
        return dto;
    }
} 