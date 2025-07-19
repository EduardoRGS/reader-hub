package com.reader_hub.application.dto;

import lombok.Data;

@Data
public class ApiResponse<T> {
    private String result;
    private T data;
    private Integer total;
    private Integer offset;
    private Integer limit;
} 