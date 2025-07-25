package com.reader_hub.application.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

// Para responses que retornam listas (collection)
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApiResponse<T> {
    private String result;
    private String response;
    private List<T> data;
    private Integer total;
    private Integer offset;
    private Integer limit;
} 