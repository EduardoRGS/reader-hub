package com.reader_hub.application.controller;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.AuthorResponseDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.service.AuthorService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/author")
@RequiredArgsConstructor
@Validated
public class AuthorController {

    private final ApiService apiService;
    private final AuthorService authorService;

    // ================== ENDPOINTS DA API EXTERNA (MangaDx) ==================
    
    @GetMapping("/external/{id}")
    public Optional<AuthorDto> getExternalAuthorById(
            @PathVariable 
            @NotBlank(message = "ID do autor é obrigatório")
            String id) {
        return apiService.getAuthorById(id);
    }

    @GetMapping("/external")
    public PaginatedDto<AuthorDto> getExternalAuthors(
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit, 
            
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        return apiService.getAuthors(limit, offset);
    }

    // ================== ENDPOINTS DO BANCO LOCAL ==================
    
    @GetMapping("/listAll")
    public List<AuthorResponseDto> getAllAuthors() {
        List<Author> authors = authorService.findAll();
        return AuthorResponseDto.fromEntityList(authors);
    }

    @GetMapping("/local/{id}")
    public ResponseEntity<AuthorResponseDto> getLocalAuthorById(
            @PathVariable 
            @NotBlank(message = "ID do autor é obrigatório")
            String id) {
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
}