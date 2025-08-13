package com.reader_hub.domain.service;

import com.reader_hub.application.dto.ChapterDto;
import com.reader_hub.application.ports.ApiService;
import com.reader_hub.domain.model.Chapter;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.repository.ChapterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChapterService {
    
    private final ChapterRepository chapterRepository;
    private final ApiService apiService;
    private final MangaService mangaService;
    
    /**
     * Salva um novo capítulo no banco de dados
     */
    public Chapter saveChapter(Chapter chapter) {
        log.info("Salvando capítulo: {}", chapter.getTitle());
        
        // Validar se o manga existe
        if (chapter.getManga() != null && chapter.getManga().getId() != null) {
            if (!mangaService.existsById(chapter.getManga().getId())) {
                throw new IllegalArgumentException("Manga não encontrado com ID: " + chapter.getManga().getId());
            }
        }
        
        var saved = chapterRepository.save(chapter);
        log.info("Capítulo salvo com ID interno: {} e apiId: {}", saved.getId(), saved.getApiId());
        return saved;
    }
    
    /**
     * Cria um novo capítulo
     */
    public Chapter createChapter(ChapterDto dto, Manga manga) {
        // Verificar se o capítulo já existe
        var existing = chapterRepository.findByMangaIdAndChapterNumber(
            manga.getId(), dto.getAttributes().getChapter());
        if (existing.isPresent()) {
            log.info("Capítulo já existe: {}", dto.getId());
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
        
        // Buscar páginas do capítulo
        try {
            List<String> pages = apiService.getChapterPages(dto.getId());
            chapter.setImages(pages);
            chapter.setPages(pages.size());
        } catch (Exception e) {
            log.warn("Erro ao buscar páginas do capítulo {}: {}", dto.getId(), e.getMessage());
        }
        
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
            throw new IllegalArgumentException("Capítulo não encontrado com ID: " + id);
        }
        
        chapterRepository.deleteById(id);
    }
    
    /**
     * Incrementa o número de views de um capítulo
     */
    public Chapter incrementViews(String id) {
        Optional<Chapter> chapterOpt = findById(id);
        if (chapterOpt.isPresent()) {
            Chapter chapter = chapterOpt.get();
            chapter.setViews(chapter.getViews() + 1);
            return chapterRepository.save(chapter);
        }
        throw new IllegalArgumentException("Capítulo não encontrado com ID: " + id);
    }
    
    /**
     * Busca e salva capítulos de um manga da API
     */
    @Transactional
    public List<Chapter> populateChaptersForManga(String mangaId) {
        Optional<Manga> mangaOpt = mangaService.findById(mangaId);
        if (mangaOpt.isEmpty()) {
            throw new IllegalArgumentException("Manga não encontrado com ID: " + mangaId);
        }
        
        Manga manga = mangaOpt.get();
        List<ChapterDto> chaptersDto = apiService.getChaptersByMangaId(manga.getApiId(), 500, 0);
        
        log.info("Encontrados {} capítulos para o manga {}", chaptersDto.size(), manga.getTitle());
        
        List<Chapter> chapters = new ArrayList<>();
        for (ChapterDto dto : chaptersDto) {
            chapters.add(createChapter(dto, manga));
            try {
                Thread.sleep(1000); // Aumentado delay para 1000ms para respeitar limites de taxa da API de forma mais segura
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Thread interrompida durante delay: {}", e.getMessage());
            }
        }
        return chapters;
    }

    /**
     * Conta total de capítulos - OTIMIZADO para estatísticas
     */
    @Transactional(readOnly = true)
    public long countAll() {
        return chapterRepository.count();
    }
}