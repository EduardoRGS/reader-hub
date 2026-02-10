package com.reader_hub.domain.service;

import com.reader_hub.application.dto.ChapterDto;
import com.reader_hub.application.exception.ResourceNotFoundException;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Chapter;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.repository.ChapterRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.function.BiConsumer;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChapterService {
    
    private final ChapterRepository chapterRepository;
    private final ApiService apiService;
    private final MangaService mangaService;

    @PersistenceContext
    private EntityManager entityManager;

    private static final int FLUSH_BATCH_SIZE = 50;
    
    /**
     * Salva um novo capítulo no banco de dados
     */
    public Chapter saveChapter(Chapter chapter) {
        // Validar se o manga existe
        if (chapter.getManga() != null && chapter.getManga().getId() != null) {
            if (!mangaService.existsById(chapter.getManga().getId())) {
                throw new ResourceNotFoundException("Manga", "ID", chapter.getManga().getId());
            }
        }
        
        var saved = chapterRepository.save(chapter);
        log.debug("Capítulo salvo: {} (apiId: {})", saved.getId(), saved.getApiId());
        return saved;
    }
    
    /**
     * Cria um novo capítulo a partir de dados da API.
     * As páginas (imagens) NÃO são buscadas aqui — são carregadas sob demanda
     * quando o usuário abre o capítulo para leitura (lazy loading).
     */
    public Chapter createChapter(ChapterDto dto, Manga manga) {
        // Verificar se o capítulo já existe
        var existing = chapterRepository.findByMangaIdAndChapterNumber(
            manga.getId(), dto.getAttributes().getChapter());
        if (existing.isPresent()) {
            log.debug("Capítulo já existe, pulando: {}", dto.getId());
            return existing.get();
        }
        
        Chapter chapter = new Chapter();
        chapter.setApiId(dto.getId());
        chapter.setTitle(dto.getAttributes().getTitle());
        chapter.setVolume(dto.getAttributes().getVolume());
        chapter.setChapter(dto.getAttributes().getChapter());
        chapter.setPages(dto.getAttributes().getPages());
        chapter.setLanguage(dto.getAttributes().getTranslatedLanguage());
        chapter.setPublishedAt(dto.getAttributes().getPublishAt());
        chapter.setCreatedAt(dto.getAttributes().getCreatedAt());
        chapter.setUpdatedAt(dto.getAttributes().getUpdatedAt());
        chapter.setReadableAt(dto.getAttributes().getReadableAt());
        chapter.setManga(manga);
        
        return saveChapter(chapter);
    }
    
    /**
     * Busca capítulo por ID
     */
    @Transactional(readOnly = true)
    public Optional<Chapter> findById(String id) {
        return chapterRepository.findById(id);
    }
    
    /**
     * Busca capítulo por ID com imagens
     */
    @Transactional(readOnly = true)
    public Optional<Chapter> findByIdWithImages(String id) {
        return chapterRepository.findByIdWithImages(id);
    }
    
    /**
     * Busca capítulos por manga
     */
    @Transactional(readOnly = true)
    public List<Chapter> findByManga(Manga manga) {
        return chapterRepository.findByMangaOrderByChapterAsc(manga);
    }
    
    /**
     * Busca capítulos por ID do manga
     */
    @Transactional(readOnly = true)
    public List<Chapter> findByMangaId(String mangaId) {
        return chapterRepository.findByMangaIdOrderByChapter(mangaId);
    }
    
    /**
     * Busca capítulos por manga e idioma
     */
    @Transactional(readOnly = true)
    public List<Chapter> findByMangaIdAndLanguage(String mangaId, String language) {
        return chapterRepository.findByMangaIdAndLanguage(mangaId, language);
    }
    
    /**
     * Busca capítulos por idioma
     */
    @Transactional(readOnly = true)
    public Page<Chapter> findByLanguage(String language, Pageable pageable) {
        return chapterRepository.findByLanguage(language, pageable);
    }
    
    /**
     * Busca capítulos mais recentes
     */
    @Transactional(readOnly = true)
    public Page<Chapter> findLatestChapters(Pageable pageable) {
        return chapterRepository.findLatestChapters(pageable);
    }
    
    /**
     * Conta capítulos por manga
     */
    @Transactional(readOnly = true)
    public Long countByMangaId(String mangaId) {
        return chapterRepository.countByMangaId(mangaId);
    }
    
    /**
     * Lista todos os capítulos
     */
    @Transactional(readOnly = true)
    public Page<Chapter> findAll(Pageable pageable) {
        return chapterRepository.findAll(pageable);
    }
    
    /**
     * Deleta um capítulo por ID
     */
    public void deleteChapter(String id) {
        log.info("Deletando capítulo: {}", id);
        
        if (!chapterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Capítulo", "ID", id);
        }
        
        chapterRepository.deleteById(id);
    }
    
    /**
     * Incrementa o número de views de um capítulo
     */
    public Chapter incrementViews(String id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Capítulo", "ID", id));
        chapter.setViews(chapter.getViews() + 1);
        return chapterRepository.save(chapter);
    }
    
    /**
     * Busca e salva capítulos de um manga da API.
     * Páginas são carregadas sob demanda (lazy loading) — não durante a importação.
     */
    @Transactional
    public int populateChaptersForManga(String mangaId) {
        return populateChaptersForManga(mangaId, null);
    }

    /**
     * Busca e salva capítulos de um manga da API com callback de progresso.
     * 
     * Otimizações de performance:
     * - Páginas NÃO são buscadas aqui (lazy loading ao ler o capítulo)
     * - Sem sleep entre capítulos (não há chamada HTTP por capítulo)
     * - Flush/clear do EntityManager a cada FLUSH_BATCH_SIZE capítulos para liberar memória
     * - Retorna apenas o count, sem acumular entidades em lista
     */
    @Transactional
    public int populateChaptersForManga(String mangaId, BiConsumer<Integer, Integer> progressCallback) {
        Manga manga = mangaService.findById(mangaId)
                .orElseThrow(() -> new ResourceNotFoundException("Manga", "ID", mangaId));
        
        List<ChapterDto> chaptersDto = apiService.getChaptersByMangaId(manga.getApiId(), 500, 0);
        int total = chaptersDto.size();
        
        log.info("Encontrados {} capítulos para o manga {}", total, manga.getTitle());
        
        if (progressCallback != null) {
            progressCallback.accept(0, total);
        }
        
        int savedCount = 0;
        for (int i = 0; i < total; i++) {
            // Verificar se a thread foi interrompida (ex.: SSE desconectou)
            if (Thread.currentThread().isInterrupted()) {
                log.warn("Thread interrompida durante importação de capítulos — parando no capítulo {}/{}", i, total);
                break;
            }
            
            createChapter(chaptersDto.get(i), manga);
            savedCount++;
            
            if (progressCallback != null) {
                progressCallback.accept(i + 1, total);
            }
            
            // Batch flush/clear para liberar memória do persistence context
            if ((i + 1) % FLUSH_BATCH_SIZE == 0) {
                entityManager.flush();
                entityManager.clear();
                // Re-attach manga pois foi desanexado pelo clear()
                manga = entityManager.merge(manga);
                log.debug("Batch flush/clear após {} capítulos", i + 1);
            }
        }
        
        return savedCount;
    }

    /**
     * Carrega as páginas (imagens) de um capítulo sob demanda.
     * Se já existem no banco, retorna direto.
     * Se não, busca da API do MangaDex, salva no banco e retorna.
     */
    @Transactional
    public Chapter loadPagesIfNeeded(String chapterId) {
        Chapter chapter = chapterRepository.findByIdWithImages(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Capítulo", "ID", chapterId));
        
        if (chapter.getImages() == null || chapter.getImages().isEmpty()) {
            if (chapter.getApiId() != null) {
                try {
                    List<String> pages = apiService.getChapterPages(chapter.getApiId());
                    chapter.setImages(pages);
                    chapter.setPages(pages.size());
                    chapterRepository.save(chapter);
                    log.info("Páginas carregadas sob demanda para capítulo {} — {} páginas", chapterId, pages.size());
                } catch (Exception e) {
                    log.warn("Erro ao carregar páginas do capítulo {}: {}", chapterId, e.getMessage());
                }
            }
        }
        
        return chapter;
    }

    /**
     * Conta total de capítulos
     */
    @Transactional(readOnly = true)
    public long countAll() {
        return chapterRepository.count();
    }
}
