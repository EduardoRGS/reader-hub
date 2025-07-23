package com.reader_hub.application.controller;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.service.AuthorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/author")
public class AuthorController {

    private final ApiService apiService;
    private AuthorService authorService;

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

    @GetMapping("/listAll")
    public List<Author> getAllAuthors () {
        return authorService.findAll();
    }

    @PostMapping
    public ResponseEntity<Author> createAuthor(@RequestBody AuthorDto authorDto) {
        var author = authorService.createAuthor(authorDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(author);
    }

    @Autowired
    public void setAuthorService(AuthorService authorService) {
        this.authorService = authorService;
    }
}