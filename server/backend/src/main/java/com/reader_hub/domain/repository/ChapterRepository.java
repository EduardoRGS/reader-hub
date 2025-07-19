package com.reader_hub.domain.repository;

import com.reader_hub.domain.model.Chapter;
import com.reader_hub.domain.model.Manga;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, String> {
    
    List<Chapter> findByMangaOrderByChapterAsc(Manga manga);
    
    @Query("SELECT c FROM Chapter c WHERE c.manga.id = :mangaId ORDER BY c.chapter ASC")
    List<Chapter> findByMangaIdOrderByChapter(@Param("mangaId") String mangaId);
    
    Page<Chapter> findByLanguage(String language, Pageable pageable);
    
    Page<Chapter> findByStatus(String status, Pageable pageable);
    
    @Query("SELECT c FROM Chapter c WHERE c.manga.id = :mangaId AND c.language = :language ORDER BY c.chapter ASC")
    List<Chapter> findByMangaIdAndLanguage(@Param("mangaId") String mangaId, @Param("language") String language);
    
    @Query("SELECT c FROM Chapter c LEFT JOIN FETCH c.images WHERE c.id = :id")
    Optional<Chapter> findByIdWithImages(@Param("id") String id);
    
    @Query("SELECT c FROM Chapter c WHERE c.manga.id = :mangaId AND c.chapter = :chapterNumber")
    Optional<Chapter> findByMangaIdAndChapterNumber(@Param("mangaId") String mangaId, @Param("chapterNumber") String chapterNumber);
    
    @Query("SELECT c FROM Chapter c ORDER BY c.publishedAt DESC")
    Page<Chapter> findLatestChapters(Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM Chapter c WHERE c.manga.id = :mangaId")
    Long countByMangaId(@Param("mangaId") String mangaId);
}
