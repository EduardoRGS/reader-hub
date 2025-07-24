package com.reader_hub.application.controller;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.AuthorResponseDto;
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

    // Endpoints da API Externa (MangaDx)
    @GetMapping("/external/{id}")
    public Optional<AuthorDto> getExternalAuthorById(@PathVariable String id) {
        return apiService.getAuthorById(id);
    }

    @GetMapping("/external")
    public PaginatedDto<AuthorDto> getExternalAuthors(@RequestParam int limit, @RequestParam int offset) {
        return apiService.getAuthors(limit, offset);
    }

    // Endpoints do Banco Local - retornando DTOs
    @GetMapping("/listAll")
    public List<AuthorResponseDto> getAllAuthors() {
        List<Author> authors = authorService.findAll();
        return AuthorResponseDto.fromEntityList(authors);
    }

    @GetMapping("/local/{id}")
    public ResponseEntity<AuthorResponseDto> getLocalAuthorById(@PathVariable String id) {
        Optional<Author> author = authorService.findById(id);
        if (author.isPresent()) {
            return ResponseEntity.ok(AuthorResponseDto.fromEntity(author.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<AuthorResponseDto> createAuthor(@RequestBody AuthorDto authorDto) {
        Author author = authorService.createAuthor(authorDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(AuthorResponseDto.fromEntity(author));
    }

    @Autowired
    public void setAuthorService(AuthorService authorService) {
        this.authorService = authorService;
    }
}