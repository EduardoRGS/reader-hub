package com.reader_hub.application.controller;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.ports.ApiService;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/author")
public class AuthorController {

    private final ApiService apiService;

    public AuthorController(ApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping("/{id}")
    public Optional<AuthorDto> getAuthorById(@PathVariable String id) {
        return apiService.getAuthorById(id);
    }

    @GetMapping()
    public PaginatedDto<AuthorDto> getAuthors(@RequestParam int limit, @RequestParam int offset) {
        return apiService.getAuthors(limit, offset);
    }
} 