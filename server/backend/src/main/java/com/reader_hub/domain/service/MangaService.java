package com.reader_hub.domain.service;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.CreateMangaDto;
import com.reader_hub.application.dto.MangaDto;
import com.reader_hub.application.dto.MangaResponseDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.repository.MangaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

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
    private final AuthorService authorService;
    private final ApiService apiService;
    
    // Cache para detecção do tipo de banco
    private Boolean isPostgreSQL = null;

    // =====================================
    // MÉTODOS BÁSICOS CRUD
    // =====================================

    @Transactional(readOnly = true)
    public Page<Manga> findAll(Pageable pageable) {
        return mangaRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "mangas", key = "#id")
    public Optional<Manga> findById(String id) {
        log.debug("Buscando manga por ID: {}", id);
        return mangaRepository.findById(id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "mangas", key = "'with-author-' + #id")
    public Optional<Manga> findByIdWithAuthor(String id) {
        log.debug("Buscando manga com autor por ID: {}", id);
        return mangaRepository.findByIdWithAuthor(id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "mangas", key = "'with-chapters-' + #id")
    public Optional<Manga> findByIdWithChapters(String id) {
        log.debug("Buscando manga com capítulos por ID: {}", id);
        return mangaRepository.findByIdWithChapters(id);
    }

    @Caching(evict = {
        @CacheEvict(value = "mangas", key = "#manga.id"),
        @CacheEvict(value = "mangas", key = "'with-author-' + #manga.id"),
        @CacheEvict(value = "mangas", key = "'with-chapters-' + #manga.id"),
        @CacheEvict(value = "manga-lists", allEntries = true),
        @CacheEvict(value = "statistics", allEntries = true)
    })
    public Manga save(Manga manga) {
        log.debug("Salvando manga: {}", manga.getId());
        return mangaRepository.save(manga);
    }

    public void delete(Manga manga) {
        mangaRepository.delete(manga);
    }

    @Transactional(readOnly = true)
    public long countAll() {
        return mangaRepository.count();
    }

    /**
     * Verifica se um manga existe por ID
     */
    @Transactional(readOnly = true)
    public boolean existsById(String id) {
        return mangaRepository.existsById(id);
    }

    // =====================================
    // QUERIES FILTRADAS
    // =====================================

    @Transactional(readOnly = true)
    public Page<Manga> findByStatus(String status, Pageable pageable) {
        return mangaRepository.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Manga> findByYear(String year, Pageable pageable) {
        return mangaRepository.findByYear(year, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Manga> findByAuthor(Author author, Pageable pageable) {
        return mangaRepository.findByAuthor(author, pageable);
    }

    /*
    @Transactional(readOnly = true)
    public Page<Manga> findByRatingGreaterThan(Double minRating, Pageable pageable) {
        return mangaRepository.findByRatingGreaterThanEqual(minRating != null ? minRating : 0.0, pageable);
    }
    */

    @Transactional(readOnly = true)
    public Page<Manga> findLatestMangas(Pageable pageable) {
        return mangaRepository.findLatestMangas(pageable);
    }

    // =====================================
    // BUSCA MULTILÍNGUE INTELIGENTE
    // =====================================

    /**
     * Busca por título com detecção automática do banco
     */
    @Transactional(readOnly = true)
    public Page<Manga> searchByTitle(String query, String preferredLanguage, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return mangaRepository.findAll(pageable);
        }

        try {
            if (isUsingPostgreSQL()) {
                // PostgreSQL: busca multilíngue otimizada
                return mangaRepository.findByTitleMultilingual(
                    query.trim(),
                    "pt-br,en", // idiomas suportados
                    preferredLanguage != null ? preferredLanguage : "pt-br",
                    true,
                    pageable
                );
            } else {
                // H2: fallback simples
                return mangaRepository.findByTitleMultilingual(
                    query.trim(),
                    "",
                    "",
                    false,
                    pageable
                );
            }
        } catch (Exception e) {
            log.warn("Erro na busca multilíngue, usando fallback: {}", e.getMessage());
            return mangaRepository.findByTitleContainingH2(query.trim(), pageable);
        }
    }

    /**
     * Busca por título em idioma específico (apenas PostgreSQL)
     */
    @Transactional(readOnly = true)
    public Page<Manga> searchByTitleInLanguage(String query, String language, Pageable pageable) {
        if (!isUsingPostgreSQL()) {
            log.warn("Busca por idioma específico não suportada no H2, usando busca geral");
            return searchByTitle(query, language, pageable);
        }

        return mangaRepository.findByTitleInLanguage(query.trim(), language, pageable);
    }

    /**
     * Busca fuzzy (tolerante a erros de digitação)
     */
    @Transactional(readOnly = true)
    public Page<Manga> searchByTitleFuzzy(String query, String preferredLanguage, Pageable pageable) {
        if (!isUsingPostgreSQL()) {
            log.warn("Busca fuzzy não suportada no H2, usando busca normal");
            return searchByTitle(query, preferredLanguage, pageable);
        }

        return mangaRepository.findByTitleFuzzy(
            query.trim(),
            preferredLanguage != null ? preferredLanguage : "pt-br",
            pageable
        );
    }

    /**
     * Busca avançada em título e descrição
     */
    @Transactional(readOnly = true)
    public Page<Manga> searchAdvanced(String query, Pageable pageable) {
        if (!isUsingPostgreSQL()) {
            return searchByTitle(query, "pt-br", pageable);
        }

        return mangaRepository.findByTitleOrDescriptionMultilingual(query.trim(), pageable);
    }

    /**
     * Mangás populares com título preferencial
     */
    @Transactional(readOnly = true)
    public Page<Manga> findPopularMangasWithPreferredTitle(Integer minFollows, String preferredLanguage, Pageable pageable) {
        if (!isUsingPostgreSQL()) {
            return mangaRepository.findByViewsGreaterThanEqual(minFollows != null ? minFollows : 0, pageable);
        }

        return mangaRepository.findPopularMangasWithPreferredTitle(
            minFollows,
            preferredLanguage != null ? preferredLanguage : "pt-br",
            pageable
        );
    }

    // =====================================
    // CRIAÇÃO DE MANGÁS
    // =====================================

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Manga createManga(MangaDto mangaDto) {
        // Verificar se já existe um manga com o mesmo apiId
        if (mangaRepository.existsByApiId(mangaDto.getId())) {
            throw new RuntimeException("Manga já existe com o apiId: " + mangaDto.getId());
        }
        
        Manga manga = convertDtoToEntity(mangaDto);
        
        // Buscar e salvar a imagem da capa
        if (manga.getApiId() != null) {
            String coverImageUrl = apiService.getMangaCoverUrl(manga.getApiId());
            manga.setCoverImage(coverImageUrl);
        }
        
        return mangaRepository.save(manga);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Manga createMangaManual(CreateMangaDto createMangaDto) {
        Manga manga = new Manga();
        manga.setTitle(Map.of("pt-br", createMangaDto.getTitle()));
        
        if (createMangaDto.getDescription() != null) {
            manga.setDescription(Map.of("pt-br", createMangaDto.getDescription()));
        }
        
        manga.setStatus(createMangaDto.getStatus());
        manga.setYear(createMangaDto.getYear());
        manga.setViews(createMangaDto.getViews());
        manga.setFollows(createMangaDto.getFollows());
        manga.setRating(createMangaDto.getRating());
        manga.setRatingCount(createMangaDto.getRatingCount());

        // Associa autor se fornecido
        if (createMangaDto.getAuthorId() != null && !createMangaDto.getAuthorId().trim().isEmpty()) {
            Optional<Author> author = authorService.findById(createMangaDto.getAuthorId());
            if (author.isPresent()) {
                manga.setAuthor(author.get());
                log.info("Associado autor {} ao manga", author.get().getName());
            } else {
                log.warn("Autor não encontrado: {}", createMangaDto.getAuthorId());
                throw new RuntimeException("Autor não encontrado: " + createMangaDto.getAuthorId());
            }
        }

        log.info("Criando manga manual: {}", createMangaDto.getTitle());
        return mangaRepository.save(manga);
    }

    // =====================================
    // ESTATÍSTICAS E RELATÓRIOS
    // =====================================

    /**
     * Estatísticas de idiomas (apenas PostgreSQL)
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getLanguageStatistics() {
        if (!isUsingPostgreSQL()) {
            return Map.of("info", 0L);
        }

        try {
            List<Object[]> results = mangaRepository.getLanguageStatistics();
            return results.stream()
                .collect(Collectors.toMap(
                    row -> (String) row[0],
                    row -> ((Number) row[1]).longValue()
                ));
        } catch (Exception e) {
            log.warn("Erro ao obter estatísticas de idiomas: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * Top mangás por período
     */
    @Transactional(readOnly = true)
    public List<Manga> getTopMangasByPeriod(String startYear, String endYear, Integer topN) {
        return mangaRepository.findTopMangasByPeriod(startYear, endYear, topN != null ? topN : 10);
    }

    // =====================================
    // MÉTODOS AUXILIARES
    // =====================================

    /**
     * Detecta se está usando PostgreSQL
     */
    private boolean isUsingPostgreSQL() {
        if (isPostgreSQL == null) {
            try {
                isPostgreSQL = mangaRepository.isPostgreSQL();
                log.info("Banco detectado: {}", isPostgreSQL ? "PostgreSQL" : "H2");
            } catch (Exception e) {
                log.warn("Erro ao detectar tipo de banco, assumindo H2: {}", e.getMessage());
                isPostgreSQL = false;
            }
        }
        return isPostgreSQL != null ? isPostgreSQL : false;
    }

    /**
     * Converte DTO para entidade
     */
    private Manga convertDtoToEntity(MangaDto mangaDto) {
        Manga manga = new Manga();
        manga.setApiId(mangaDto.getId());
        manga.setTitle(mangaDto.getAttributes() != null ? mangaDto.getAttributes().getTitle() : null);
        manga.setDescription(mangaDto.getAttributes() != null ? mangaDto.getAttributes().getDescription() : null);
        manga.setStatus(mangaDto.getAttributes() != null ? mangaDto.getAttributes().getStatus() : "unknown");
        manga.setYear(mangaDto.getAttributes() != null ? mangaDto.getAttributes().getYear() : null);
        
        // Processar relacionamentos de autor
        if (mangaDto.getRelationships() != null && !mangaDto.getRelationships().isEmpty()) {
            processAuthorRelationships(manga, mangaDto.getRelationships());
        }
        
        return manga;
    }

    /**
     * Processa relacionamentos de autor
     */
    private void processAuthorRelationships(Manga manga, List<MangaDto.SimpleRelationship> relationships) {
        Optional<MangaDto.SimpleRelationship> authorRelation = relationships.stream()
            .filter(rel -> "author".equals(rel.getType()))
            .findFirst();

        if (authorRelation.isPresent()) {
            String authorApiId = authorRelation.get().getId();
            
            // Busca no banco local primeiro
            Optional<Author> localAuthor = authorService.findByApiId(authorApiId);
            
            if (localAuthor.isPresent()) {
                manga.setAuthor(localAuthor.get());
                log.debug("Autor local encontrado: {}", localAuthor.get().getName());
            } else {
                // Busca na API externa e cria
                try {
                    Optional<AuthorDto> authorDto = apiService.getAuthorById(authorApiId);
                    if (authorDto.isPresent()) {
                        Author newAuthor = authorService.createAuthor(authorDto.get());
                        manga.setAuthor(newAuthor);
                        log.info("Novo autor criado: {}", newAuthor.getName());
                    } else {
                        log.warn("Autor não encontrado na API: {}", authorApiId);
                    }
                } catch (Exception e) {
                    log.warn("Erro ao buscar autor na API externa {}: {}", authorApiId, e.getMessage());
                }
            }
        }
    }
}