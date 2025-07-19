package com.reader_hub.domain.repository;

import com.reader_hub.domain.model.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, String> {
    
    Optional<Author> findByName(String name);
    
    @Query("SELECT a FROM Author a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Author> findByNameContainingIgnoreCase(@Param("name") String name);
    
    @Query("SELECT a FROM Author a LEFT JOIN FETCH a.mangas WHERE a.id = :id")
    Optional<Author> findByIdWithMangas(@Param("id") String id);
    
    boolean existsByName(String name);
}
