package com.reader_hub.domain.service;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.MangaDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.repository.MangaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MangaService {
    
    private final MangaRepository mangaRepository;
    private final ApiService apiService;
    private final AuthorService authorService;
    
    /**
     * Salva um novo mangá no banco de dados
     */
    @Transactional()
    public Manga saveManga(Manga manga) {
        log.info("Salvando mangá: {}", manga.getId());
        
        // Validar se o autor existe caso tenha sido especificado
        if (manga.getAuthor() != null && manga.getAuthor().getId() != null) {
            if (!authorService.existsById(manga.getAuthor().getId())) {
                throw new IllegalArgumentException("Autor não encontrado com ID: " + manga.getAuthor().getId());
            }
        }
        var saved = mangaRepository.save(manga);
        log.info("Mangá salvo com ID interno: {} e apiId: {}", saved.getId(), saved.getApiId());
        return saved;
    }
    
    /**
     * Cria um novo mangá
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Manga createManga(MangaDto dto) {
        var existente = mangaRepository.findByApiId(dto.getId());

        if (existente.isPresent()) {
            log.info("Mangá já existe: {}", dto.getId());
            return existente.get();
        }

        var filteredTitle = dto.getAttributes().getTitle().entrySet().stream()
                .filter(e -> List.of("pt-br", "en").contains(e.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        var descriptionFiltered = dto.getAttributes().getDescription().entrySet().stream()
                .filter(e -> e.getKey().equals("en") || e.getKey().equals("pt-br"))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        Manga manga = new Manga();
        manga.setApiId(dto.getId());
        manga.setTitle(filteredTitle);
        manga.setDescription(descriptionFiltered);
        manga.setStatus(dto.getAttributes().getStatus());
        manga.setYear(dto.getAttributes().getYear());
        
        // Se foi informado um autor, buscar e associar
        var relationAuthor = Arrays.stream(dto.getRelationships())
                .filter(type -> type.getType().equals("author")).findFirst().orElse(null);
        if (relationAuthor != null) {
            var author = authorService.findByApiId(relationAuthor.getId());
            if (author.isPresent()) {
                manga.setAuthor(author.get());
            } else {
                throw new IllegalArgumentException("Autor não encontrado com ID: " + relationAuthor.getType());
            }
        }

        return saveManga(manga);
    }
    
    /**
     * Atualiza um mangá existente
     */
    public Manga updateManga(Manga manga) {
        log.info("Atualizando mangá: {}", manga.getId());
        
        if (!mangaRepository.existsById(manga.getId())) {
            throw new IllegalArgumentException("Mangá não encontrado com ID: " + manga.getId());
        }
        
        return mangaRepository.save(manga);
    }
    
    /**
     * Busca mangá por ID
     */
    @Transactional(readOnly = true)
    public Optional<Manga> findById(String id) {
        return mangaRepository.findById(id);
    }
    
    /**
     * Busca mangá por ID com capítulos relacionados
     */
    @Transactional(readOnly = true)
    public Optional<Manga> findByIdWithChapters(String id) {
        return mangaRepository.findByIdWithChapters(id);
    }
    
    /**
     * Busca mangá por ID com autor relacionado
     */
    @Transactional(readOnly = true)
    public Optional<Manga> findByIdWithAuthor(String id) {
        return mangaRepository.findByIdWithAuthor(id);
    }
    
    /**
     * Busca mangás por status
     */
    @Transactional(readOnly = true)
    public Page<Manga> findByStatus(String status, Pageable pageable) {
        return mangaRepository.findByStatus(status, pageable);
    }
    
    /**
     * Busca mangás por autor
     */
    @Transactional(readOnly = true)
    public Page<Manga> findByAuthor(Author author, Pageable pageable) {
        return mangaRepository.findByAuthor(author, pageable);
    }
    
    /**
     * Busca mangás por ID do autor
     */
    @Transactional(readOnly = true)
    public List<Manga> findByAuthorId(String authorId) {
        return mangaRepository.findByAuthorId(authorId);
    }
    
    /**
     * Busca mangás por rating mínimo
     */
    @Transactional(readOnly = true)
    public Page<Manga> findByMinimumRating(Double minRating, Pageable pageable) {
        return mangaRepository.findByRatingGreaterThanEqual(minRating, pageable);
    }
    
    /**
     * Busca mangás por número mínimo de views
     */
    @Transactional(readOnly = true)
    public Page<Manga> findByMinimumViews(Integer minViews, Pageable pageable) {
        return mangaRepository.findByViewsGreaterThanEqual(minViews, pageable);
    }
    
    /**
     * Busca mangás mais recentes
     */
    @Transactional(readOnly = true)
    public Page<Manga> findLatestMangas(Pageable pageable) {
        return mangaRepository.findLatestMangas(pageable);
    }
    
    /**
     * Busca mangás por ano de publicação
     */
    @Transactional(readOnly = true)
    public Page<Manga> findByYear(String year, Pageable pageable) {
        return mangaRepository.findByYear(year, pageable);
    }
    
    /**
     * Lista todos os mangás
     */
    @Transactional(readOnly = true)
    public Page<Manga> findAll(Pageable pageable) {
        return mangaRepository.findAll(pageable);
    }
    
    /**
     * Deleta um mangá por ID
     */
    public void deleteManga(String id) {
        log.info("Deletando mangá: {}", id);
        
        if (!mangaRepository.existsById(id)) {
            throw new IllegalArgumentException("Mangá não encontrado com ID: " + id);
        }
        
        mangaRepository.deleteById(id);
    }
    
    /**
     * Verifica se um mangá existe por ID
     */
    @Transactional(readOnly = true)
    public boolean existsById(String id) {
        return mangaRepository.existsById(id);
    }
    
    /**
     * Incrementa o número de views de um mangá
     */
    public Manga incrementViews(String id) {
        Optional<Manga> mangaOpt = findById(id);
        if (mangaOpt.isPresent()) {
            Manga manga = mangaOpt.get();
            manga.setViews(manga.getViews() + 1);
            return updateManga(manga);
        }
        throw new IllegalArgumentException("Mangá não encontrado com ID: " + id);
    }
    
    /**
     * Incrementa o número de follows de um mangá
     */
    public Manga incrementFollows(String id) {
        Optional<Manga> mangaOpt = findById(id);
        if (mangaOpt.isPresent()) {
            Manga manga = mangaOpt.get();
            manga.setFollows(manga.getFollows() + 1);
            return updateManga(manga);
        }
        throw new IllegalArgumentException("Mangá não encontrado com ID: " + id);
    }

    @Autowired
    public ApiService setApiService(ApiService apiService) {
        return apiService;
    }
} 