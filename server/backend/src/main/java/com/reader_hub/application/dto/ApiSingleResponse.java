package com.reader_hub.application.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

// Para responses que retornam um único item
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApiSingleResponse<T> {
    private String result;
    private String response;
    private T data;
} 