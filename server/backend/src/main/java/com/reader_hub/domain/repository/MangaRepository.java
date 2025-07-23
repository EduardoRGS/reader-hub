package com.reader_hub.domain.repository;

import com.reader_hub.domain.model.Manga;
import com.reader_hub.domain.model.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MangaRepository extends JpaRepository<Manga, String> {
    
    Page<Manga> findByStatus(String status, Pageable pageable);
    
    Page<Manga> findByAuthor(Author author, Pageable pageable);

    @Query("SELECT m FROM Manga m WHERE m.apiId = :apiId")
    Optional<Manga> findByApiId(@Param("apiId") String apiId);
    
    @Query("SELECT m FROM Manga m WHERE m.author.id = :authorId")
    List<Manga> findByAuthorId(@Param("authorId") String authorId);
    
    @Query("SELECT m FROM Manga m LEFT JOIN FETCH m.chapters WHERE m.id = :id")
    Optional<Manga> findByIdWithChapters(@Param("id") String id);
    
    @Query("SELECT m FROM Manga m LEFT JOIN FETCH m.author WHERE m.id = :id")
    Optional<Manga> findByIdWithAuthor(@Param("id") String id);
    
    @Query("SELECT m FROM Manga m WHERE m.rating >= :minRating ORDER BY m.rating DESC")
    Page<Manga> findByRatingGreaterThanEqual(@Param("minRating") Double minRating, Pageable pageable);
    
    @Query("SELECT m FROM Manga m WHERE m.views >= :minViews ORDER BY m.views DESC")
    Page<Manga> findByViewsGreaterThanEqual(@Param("minViews") Integer minViews, Pageable pageable);
    
    @Query("SELECT m FROM Manga m ORDER BY m.createdAt DESC")
    Page<Manga> findLatestMangas(Pageable pageable);
    
    @Query("SELECT m FROM Manga m WHERE m.year = :year")
    Page<Manga> findByYear(@Param("year") String year, Pageable pageable);
}
