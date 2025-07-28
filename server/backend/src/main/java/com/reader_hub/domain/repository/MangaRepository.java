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
    
    // =====================================
    // QUERIES BÁSICAS
    // =====================================
    
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
    
    // =====================================
    // QUERIES OTIMIZADAS PARA POSTGRESQL
    // =====================================
    
    /**
     * Busca multilíngue usando funções PostgreSQL customizadas
     * Funciona com H2 (fallback) e PostgreSQL (otimizado)
     */
    @Query(value = """
        SELECT * FROM mangas m 
        WHERE (:usePostgreSQL = false AND LOWER(CAST(m.title AS text)) LIKE LOWER(CONCAT('%', :query, '%')))
           OR (:usePostgreSQL = true AND search_multilingual_text(m.title, :query, ARRAY[:languages]))
        ORDER BY 
            CASE WHEN :usePostgreSQL = true THEN 
                (CASE WHEN jsonb_exists(m.title, :preferredLang) THEN 1 ELSE 2 END)
            ELSE m.created_at 
            END DESC
        """, nativeQuery = true)
    Page<Manga> findByTitleMultilingual(
        @Param("query") String query,
        @Param("languages") String languages,
        @Param("preferredLang") String preferredLang,
        @Param("usePostgreSQL") boolean usePostgreSQL,
        Pageable pageable
    );
    
    /**
     * Busca por título em idioma específico (PostgreSQL)
     */
    @Query(value = """
        SELECT * FROM mangas m 
        WHERE jsonb_exists(m.title, :language) 
        AND unaccent(lower(m.title->>:language)) ILIKE unaccent(lower(CONCAT('%', :query, '%')))
        ORDER BY similarity(m.title->>:language, :query) DESC
        """, nativeQuery = true)
    Page<Manga> findByTitleInLanguage(
        @Param("query") String query,
        @Param("language") String language,
        Pageable pageable
    );
    
    /**
     * Busca fuzzy usando pg_trgm (PostgreSQL)
     */
    @Query(value = """
        SELECT *, similarity(get_preferred_title(title, :preferredLang), :query) as sim_score
        FROM mangas m 
        WHERE get_preferred_title(title, :preferredLang) % :query
        ORDER BY sim_score DESC, rating DESC
        """, nativeQuery = true)
    Page<Manga> findByTitleFuzzy(
        @Param("query") String query,
        @Param("preferredLang") String preferredLang,
        Pageable pageable
    );
    
    /**
     * Busca avançada combinando título e descrição
     */
    @Query(value = """
        SELECT DISTINCT m.* FROM mangas m 
        WHERE search_multilingual_text(m.title, :query, ARRAY['pt-br', 'en'])
           OR search_multilingual_text(m.description, :query, ARRAY['pt-br', 'en'])
        ORDER BY 
            (CASE WHEN search_multilingual_text(m.title, :query, ARRAY['pt-br', 'en']) THEN 1 ELSE 2 END),
            m.rating DESC,
            m.follows DESC
        """, nativeQuery = true)
    Page<Manga> findByTitleOrDescriptionMultilingual(
        @Param("query") String query,
        Pageable pageable
    );
    
    /**
     * Mangás populares com título preferencial
     */
    @Query(value = """
        SELECT m.*, get_preferred_title(m.title, :preferredLang) as preferred_title
        FROM mangas m 
        WHERE m.follows >= :minFollows
        ORDER BY m.follows DESC, m.rating DESC
        """, nativeQuery = true)
    Page<Manga> findPopularMangasWithPreferredTitle(
        @Param("minFollows") Integer minFollows,
        @Param("preferredLang") String preferredLang,
        Pageable pageable
    );
    
    /**
     * Mangás por status com título no idioma preferido
     */
    @Query(value = """
        SELECT * FROM mangas m 
        WHERE m.status = :status 
        AND (jsonb_exists(m.title, :language) OR jsonb_exists(m.title, 'en'))
        ORDER BY 
            (CASE WHEN jsonb_exists(m.title, :language) THEN 1 ELSE 2 END),
            m.updated_at DESC
        """, nativeQuery = true)
    Page<Manga> findByStatusWithLanguagePreference(
        @Param("status") String status,
        @Param("language") String language,
        Pageable pageable
    );
    
    /**
     * Estatísticas por idioma
     */
    @Query(value = """
        SELECT 
            jsonb_object_keys(title) as language,
            COUNT(*) as count
        FROM mangas 
        WHERE title IS NOT NULL
        GROUP BY jsonb_object_keys(title)
        ORDER BY count DESC
        """, nativeQuery = true)
    List<Object[]> getLanguageStatistics();
    
    /**
     * Mangás sem título em idioma específico
     */
    @Query(value = """
        SELECT * FROM mangas m 
        WHERE NOT jsonb_exists(m.title, :language)
        ORDER BY m.created_at DESC
        """, nativeQuery = true)
    Page<Manga> findMangasWithoutLanguage(
        @Param("language") String language,
        Pageable pageable
    );
    
    /**
     * Top mangás por período com função de janela
     */
    @Query(value = """
        SELECT * FROM (
            SELECT m.*,
                   ROW_NUMBER() OVER (PARTITION BY m.publication_year ORDER BY m.rating DESC, m.follows DESC) as rank
            FROM mangas m 
            WHERE m.publication_year BETWEEN :startYear AND :endYear
        ) ranked 
        WHERE rank <= :topN
        ORDER BY publication_year DESC, rank ASC
        """, nativeQuery = true)
    List<Manga> findTopMangasByPeriod(
        @Param("startYear") String startYear,
        @Param("endYear") String endYear,
        @Param("topN") Integer topN
    );
    
    // =====================================
    // QUERIES DE COMPATIBILIDADE H2
    // =====================================
    
    /**
     * Fallback para busca de título no H2
     */
    @Query("SELECT m FROM Manga m WHERE LOWER(CAST(m.title AS string)) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Manga> findByTitleContainingH2(@Param("query") String query, Pageable pageable);
    
    /**
     * Verifica se está usando PostgreSQL
     */
    @Query(value = "SELECT current_setting('server_version_num')::int >= 90400", nativeQuery = true)
    Boolean isPostgreSQL();
}
