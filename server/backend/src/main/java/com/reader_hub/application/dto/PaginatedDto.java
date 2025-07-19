package com.reader_hub.application.dto;

import lombok.Data;

import java.util.List;

@Data
public class PaginatedDto<T> {
    private List<T> data;
    private Integer total;
    private Integer offset;
    private Integer limit;
    private Integer page;
    private Integer totalPages;
    
    public PaginatedDto(List<T> data, Integer total, Integer offset, Integer limit) {
        this.data = data;
        this.total = total;
        this.offset = offset;
        this.limit = limit;
        this.page = (offset / limit) + 1;
        this.totalPages = (int) Math.ceil((double) total / limit);
    }
} 