package com.reader_hub.domain.service;

import com.reader_hub.application.dto.AuthorDto;
import com.reader_hub.application.dto.CreateMangaDto;
import com.reader_hub.application.dto.ExternalMangaDto;
import com.reader_hub.application.dto.MangaResponseDto;
import com.reader_hub.application.exception.BusinessException;
import com.reader_hub.application.exception.DuplicateResourceException;
import com.reader_hub.application.exception.ResourceNotFoundException;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Author;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.repository.MangaRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MangaService {

    private final MangaRepository mangaRepository;
    private final AuthorService authorService;
    private final ApiService apiService;
    
    // Detecção thread-safe do tipo de banco, inicializada uma vez
    private volatile Boolean isPostgreSQL = null;

    // =====================================
    // MÉTODOS BÁSICOS CRUD
    // =====================================

    @Transactional(readOnly = true)
    public Page<Manga> findAll(Pageable pageable) {
        return mangaRepository.findAll(pageable);
    }

    /**
     * Busca simples por título usando JPQL (funciona em PostgreSQL e H2).
     * Faz LIKE no campo title serializado como string.
     */
    @Transactional(readOnly = true)
    public Page<Manga> searchByTitleSimple(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return mangaRepository.findAll(pageable);
        }
        return mangaRepository.findByTitleContainingH2(query.trim(), pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Manga> findById(String id) {
        log.debug("Buscando manga por ID: {}", id);
        return mangaRepository.findById(id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "mangas", key = "#id")
    public Manga getByIdCached(String id) {
        log.debug("Buscando manga por ID (com cache): {}", id);
        return mangaRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Optional<Manga> findByIdWithAuthor(String id) {
        log.debug("Buscando manga com autor por ID: {}", id);
        return mangaRepository.findByIdWithAuthor(id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "mangas", key = "'with-author-' + #id")
    public Manga getByIdWithAuthorCached(String id) {
        log.debug("Buscando manga com autor por ID (com cache): {}", id);
        return mangaRepository.findByIdWithAuthor(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Optional<Manga> findByIdWithChapters(String id) {
        log.debug("Buscando manga com capítulos por ID: {}", id);
        return mangaRepository.findByIdWithChapters(id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "mangas", key = "'with-chapters-' + #id")
    public Manga getByIdWithChaptersCached(String id) {
        log.debug("Buscando manga com capítulos por ID (com cache): {}", id);
        return mangaRepository.findByIdWithChapters(id).orElse(null);
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

    /**
     * Deleta um manga por ID, junto com todos os capítulos associados (cascade).
     * Invalida caches relacionados.
     */
    @Caching(evict = {
        @CacheEvict(value = "mangas", key = "#id"),
        @CacheEvict(value = "mangas", key = "'with-author-' + #id"),
        @CacheEvict(value = "mangas", key = "'with-chapters-' + #id"),
        @CacheEvict(value = "manga-lists", allEntries = true),
        @CacheEvict(value = "statistics", allEntries = true)
    })
    public void deleteById(String id) {
        Manga manga = mangaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Manga", "ID", id));
        log.info("Deletando manga '{}' (ID: {}) e seus capítulos", 
            manga.getTitle(), id);
        mangaRepository.delete(manga);
    }

    /**
     * Deleta múltiplos mangás por IDs em lote, junto com seus capítulos (cascade).
     * Retorna o número de mangás efetivamente deletados.
     */
    @Caching(evict = {
        @CacheEvict(value = "mangas", allEntries = true),
        @CacheEvict(value = "manga-lists", allEntries = true),
        @CacheEvict(value = "statistics", allEntries = true)
    })
    public int deleteByIds(List<String> ids) {
        List<Manga> mangas = mangaRepository.findAllById(ids);
        if (mangas.isEmpty()) {
            return 0;
        }
        log.info("Deletando {} mangá(s) em lote e seus capítulos", mangas.size());
        mangaRepository.deleteAll(mangas);
        return mangas.size();
    }

    @Transactional(readOnly = true)
    public long countAll() {
        return mangaRepository.count();
    }

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

    @Transactional(readOnly = true)
    public Page<Manga> findLatestMangas(Pageable pageable) {
        return mangaRepository.findLatestMangas(pageable);
    }

    // =====================================
    // BUSCA MULTILÍNGUE INTELIGENTE
    // =====================================

    @Transactional(readOnly = true)
    public Page<Manga> searchByTitle(String query, String preferredLanguage, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return mangaRepository.findAll(pageable);
        }

        try {
            if (isUsingPostgreSQL()) {
                return mangaRepository.findByTitleMultilingual(
                    query.trim(),
                    "pt-br,en",
                    preferredLanguage != null ? preferredLanguage : "pt-br",
                    true,
                    pageable
                );
            } else {
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

    @Transactional(readOnly = true)
    public Page<Manga> searchByTitleInLanguage(String query, String language, Pageable pageable) {
        if (!isUsingPostgreSQL()) {
            log.warn("Busca por idioma específico não suportada no H2, usando busca geral");
            return searchByTitle(query, language, pageable);
        }

        return mangaRepository.findByTitleInLanguage(query.trim(), language, pageable);
    }

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

    @Transactional(readOnly = true)
    public Page<Manga> searchAdvanced(String query, Pageable pageable) {
        if (!isUsingPostgreSQL()) {
            return searchByTitle(query, "pt-br", pageable);
        }

        return mangaRepository.findByTitleOrDescriptionMultilingual(query.trim(), pageable);
    }

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

    /**
     * Cria manga a partir de dados da API externa.
     * Usa READ_COMMITTED (padrão) com verificação de existência.
     */
    @Transactional
    public Manga createManga(ExternalMangaDto mangaDto) {
        if (mangaRepository.existsByApiId(mangaDto.getId())) {
            throw new DuplicateResourceException("Manga", "apiId", mangaDto.getId());
        }
        
        Manga manga = convertDtoToEntity(mangaDto);
        
        // Buscar e salvar a imagem da capa
        if (manga.getApiId() != null) {
            try {
                String coverImageUrl = apiService.getMangaCoverUrl(manga.getApiId());
                manga.setCoverImage(coverImageUrl);
            } catch (Exception e) {
                log.warn("Não foi possível obter a capa do manga {}: {}", manga.getApiId(), e.getMessage());
            }
        }
        
        return mangaRepository.save(manga);
    }

    /**
     * Cria manga manualmente (sem API externa).
     * Gera um apiId sintético para manter consistência.
     */
    @Transactional
    public Manga createMangaManual(CreateMangaDto createMangaDto) {
        Manga manga = new Manga();
        
        // Gerar apiId sintético para mangás manuais
        manga.setApiId("manual-" + UUID.randomUUID().toString());
        
        // Suportar títulos multilíngues ou título simples
        if (createMangaDto.getTitles() != null && !createMangaDto.getTitles().isEmpty()) {
            manga.setTitle(new HashMap<>(createMangaDto.getTitles()));
        } else {
            manga.setTitle(Map.of("pt-br", createMangaDto.getTitle()));
        }
        
        // Suportar descrições multilíngues ou descrição simples
        if (createMangaDto.getDescriptions() != null && !createMangaDto.getDescriptions().isEmpty()) {
            manga.setDescription(new HashMap<>(createMangaDto.getDescriptions()));
        } else if (createMangaDto.getDescription() != null) {
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
            Author author = authorService.findById(createMangaDto.getAuthorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Autor", "ID", createMangaDto.getAuthorId()));
            manga.setAuthor(author);
            log.info("Associado autor {} ao manga", author.getName());
        }

        log.info("Criando manga manual: {}", createMangaDto.getTitle());
        return mangaRepository.save(manga);
    }

    // =====================================
    // ESTATÍSTICAS E RELATÓRIOS
    // =====================================

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

    @Transactional(readOnly = true)
    public List<Manga> getTopMangasByPeriod(String startYear, String endYear, Integer topN) {
        return mangaRepository.findTopMangasByPeriod(startYear, endYear, topN != null ? topN : 10);
    }

    // =====================================
    // MÉTODOS AUXILIARES
    // =====================================

    /**
     * Detecta se está usando PostgreSQL (thread-safe com double-checked locking).
     */
    private boolean isUsingPostgreSQL() {
        if (isPostgreSQL == null) {
            synchronized (this) {
                if (isPostgreSQL == null) {
                    try {
                        isPostgreSQL = mangaRepository.isPostgreSQL();
                        log.info("Banco detectado: {}", isPostgreSQL ? "PostgreSQL" : "H2");
                    } catch (Exception e) {
                        log.warn("Erro ao detectar tipo de banco, assumindo H2: {}", e.getMessage());
                        isPostgreSQL = false;
                    }
                }
            }
        }
        return isPostgreSQL;
    }

    /**
     * Converte DTO externo para entidade
     */
    private Manga convertDtoToEntity(ExternalMangaDto mangaDto) {
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
    private void processAuthorRelationships(Manga manga, List<ExternalMangaDto.SimpleRelationship> relationships) {
        Optional<ExternalMangaDto.SimpleRelationship> authorRelation = relationships.stream()
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
