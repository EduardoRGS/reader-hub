package com.reader_hub.domain.service;

import com.reader_hub.domain.model.Chapter;
import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.repository.ChapterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChapterService {
    
    private final ChapterRepository chapterRepository;
    private final MangaService mangaService;
    
    /**
     * Salva um novo capítulo no banco de dados
     */
    public Chapter saveChapter(Chapter chapter) {
        log.info("Salvando capítulo: {} do mangá: {}", chapter.getChapter(), 
                chapter.getManga() != null ? chapter.getManga().getId() : "N/A");
        
        // Validar se o mangá existe caso tenha sido especificado
        if (chapter.getManga() != null && chapter.getManga().getId() != null) {
            if (!mangaService.existsById(chapter.getManga().getId())) {
                throw new IllegalArgumentException("Mangá não encontrado com ID: " + chapter.getManga().getId());
            }
        }
        
        return chapterRepository.save(chapter);
    }
    
    /**
     * Cria um novo capítulo
     */
    public Chapter createChapter(String id, String title, String chapterNumber, String mangaId) {
        log.info("Criando novo capítulo - ID: {}, Número: {}, Mangá ID: {}", id, chapterNumber, mangaId);
        
        Chapter chapter = new Chapter();
        chapter.setId(id);
        chapter.setTitle(title);
        chapter.setChapter(chapterNumber);
        
        // Se foi informado um mangá, buscar e associar
        if (mangaId != null) {
            Optional<Manga> manga = mangaService.findById(mangaId);
            if (manga.isPresent()) {
                chapter.setManga(manga.get());
            } else {
                throw new IllegalArgumentException("Mangá não encontrado com ID: " + mangaId);
            }
        }
        
        return saveChapter(chapter);
    }
    
    /**
     * Atualiza um capítulo existente
     */
    public Chapter updateChapter(Chapter chapter) {
        log.info("Atualizando capítulo: {}", chapter.getId());
        
        if (!chapterRepository.existsById(chapter.getId())) {
            throw new IllegalArgumentException("Capítulo não encontrado com ID: " + chapter.getId());
        }
        
        return chapterRepository.save(chapter);
    }
    
    /**
     * Busca capítulo por ID
     */
    @Transactional(readOnly = true)
    public Optional<Chapter> findById(String id) {
        return chapterRepository.findById(id);
    }
    
    /**
     * Busca capítulo por ID com imagens relacionadas
     */
    @Transactional(readOnly = true)
    public Optional<Chapter> findByIdWithImages(String id) {
        return chapterRepository.findByIdWithImages(id);
    }
    
    /**
     * Busca capítulos por mangá (ordenados por número do capítulo)
     */
    @Transactional(readOnly = true)
    public List<Chapter> findByManga(Manga manga) {
        return chapterRepository.findByMangaOrderByChapterAsc(manga);
    }
    
    /**
     * Busca capítulos por ID do mangá (ordenados por número do capítulo)
     */
    @Transactional(readOnly = true)
    public List<Chapter> findByMangaId(String mangaId) {
        return chapterRepository.findByMangaIdOrderByChapter(mangaId);
    }
    
    /**
     * Busca capítulos por ID do mangá e idioma
     */
    @Transactional(readOnly = true)
    public List<Chapter> findByMangaIdAndLanguage(String mangaId, String language) {
        return chapterRepository.findByMangaIdAndLanguage(mangaId, language);
    }
    
    /**
     * Busca capítulo específico por mangá e número do capítulo
     */
    @Transactional(readOnly = true)
    public Optional<Chapter> findByMangaIdAndChapterNumber(String mangaId, String chapterNumber) {
        return chapterRepository.findByMangaIdAndChapterNumber(mangaId, chapterNumber);
    }
    
    /**
     * Busca capítulos por idioma
     */
    @Transactional(readOnly = true)
    public Page<Chapter> findByLanguage(String language, Pageable pageable) {
        return chapterRepository.findByLanguage(language, pageable);
    }
    
    /**
     * Busca capítulos por status
     */
    @Transactional(readOnly = true)
    public Page<Chapter> findByStatus(String status, Pageable pageable) {
        return chapterRepository.findByStatus(status, pageable);
    }
    
    /**
     * Busca capítulos mais recentes
     */
    @Transactional(readOnly = true)
    public Page<Chapter> findLatestChapters(Pageable pageable) {
        return chapterRepository.findLatestChapters(pageable);
    }
    
    /**
     * Lista todos os capítulos
     */
    @Transactional(readOnly = true)
    public Page<Chapter> findAll(Pageable pageable) {
        return chapterRepository.findAll(pageable);
    }
    
    /**
     * Conta o número de capítulos de um mangá
     */
    @Transactional(readOnly = true)
    public Long countByMangaId(String mangaId) {
        return chapterRepository.countByMangaId(mangaId);
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
     * Verifica se um capítulo existe por ID
     */
    @Transactional(readOnly = true)
    public boolean existsById(String id) {
        return chapterRepository.existsById(id);
    }
    
    /**
     * Incrementa o número de views de um capítulo
     */
    public Chapter incrementViews(String id) {
        Optional<Chapter> chapterOpt = findById(id);
        if (chapterOpt.isPresent()) {
            Chapter chapter = chapterOpt.get();
            chapter.setViews(chapter.getViews() + 1);
            return updateChapter(chapter);
        }
        throw new IllegalArgumentException("Capítulo não encontrado com ID: " + id);
    }
    
    /**
     * Adiciona imagens a um capítulo
     */
    public Chapter addImagesToChapter(String chapterId, List<String> imageUrls) {
        Optional<Chapter> chapterOpt = findById(chapterId);
        if (chapterOpt.isPresent()) {
            Chapter chapter = chapterOpt.get();
            if (chapter.getImages() == null) {
                chapter.setImages(imageUrls);
            } else {
                chapter.getImages().addAll(imageUrls);
            }
            chapter.setPages(chapter.getImages().size());
            return updateChapter(chapter);
        }
        throw new IllegalArgumentException("Capítulo não encontrado com ID: " + chapterId);
    }
} 