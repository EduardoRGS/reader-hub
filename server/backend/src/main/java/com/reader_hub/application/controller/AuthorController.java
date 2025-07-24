package com.reader_hub.application.controller;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.AuthorResponseDto;
import com.reader_hub.application.dto.PaginatedDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.service.AuthorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "👤 Autores", description = "Gerenciamento de autores")
public class AuthorController {

    private final ApiService apiService;
    private final AuthorService authorService;

    // ================== ENDPOINTS DA API EXTERNA (MangaDx) ==================
    
    @Operation(summary = "Buscar autor da API externa", description = "Obtém um autor específico da API MangaDX")
    @Tag(name = "🌐 API Externa")
    @GetMapping("/external/{id}")
    public Optional<AuthorDto> getExternalAuthorById(
            @Parameter(description = "ID do autor na API MangaDX")
            @PathVariable 
            @NotBlank(message = "ID do autor é obrigatório")
            String id) {
        return apiService.getAuthorById(id);
    }

    @Operation(summary = "Listar autores da API externa", description = "Obtém lista de autores da API MangaDX")
    @Tag(name = "🌐 API Externa")
    @GetMapping("/external")
    public PaginatedDto<AuthorDto> getExternalAuthors(
            @Parameter(description = "Número máximo de resultados", example = "20")
            @RequestParam(defaultValue = "20") 
            @Min(value = 1, message = "{common.limit.range}")
            @Max(value = 100, message = "{common.limit.range}")
            Integer limit, 
            
            @Parameter(description = "Número de itens a pular", example = "0")
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "{common.offset.positive}")
            Integer offset) {
        return apiService.getAuthors(limit, offset);
    }

    // ================== ENDPOINTS DO BANCO LOCAL ==================
    
    @Operation(summary = "Listar todos os autores", description = "Obtém lista completa de autores do banco local")
    @GetMapping("/listAll")
    public List<AuthorResponseDto> getAllAuthors() {
        List<Author> authors = authorService.findAll();
        return AuthorResponseDto.fromEntityList(authors);
    }

    @Operation(summary = "Buscar autor por ID", description = "Obtém um autor específico do banco local")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autor encontrado"),
        @ApiResponse(responseCode = "404", description = "Autor não encontrado")
    })
    @GetMapping("/local/{id}")
    public ResponseEntity<AuthorResponseDto> getLocalAuthorById(
            @Parameter(description = "ID único do autor", example = "123e4567-e89b-12d3-a456-426614174000")
            @PathVariable 
            @NotBlank(message = "ID do autor é obrigatório")
            String id) {
        Optional<Author> author = authorService.findById(id);
        if (author.isPresent()) {
            return ResponseEntity.ok(AuthorResponseDto.fromEntity(author.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Criar autor", description = "Cria um novo autor no banco local usando dados da API externa")
    @PostMapping
    public ResponseEntity<AuthorResponseDto> createAuthor(@RequestBody AuthorDto authorDto) {
        Author author = authorService.createAuthor(authorDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(AuthorResponseDto.fromEntity(author));
    }
}