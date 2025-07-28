package com.reader_hub.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "mangas", indexes = {
    @Index(name = "idx_manga_api_id", columnList = "apiId"),
    @Index(name = "idx_manga_status", columnList = "status"),
    @Index(name = "idx_manga_year", columnList = "year"),
    @Index(name = "idx_manga_rating", columnList = "rating"),
    @Index(name = "idx_manga_created_at", columnList = "created_at"),
    @Index(name = "idx_manga_title_gin", columnList = "title") // GIN index para JSONB
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Manga {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String apiId;
    
    // OTIMIZAÇÃO POSTGRESQL: JSONB para títulos multilíngues
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> title;
    
    // OTIMIZAÇÃO POSTGRESQL: JSONB para descrições multilíngues  
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> description;
    
    @Column(nullable = false, length = 20)
    private String status;
    
    @Column(name = "publication_year", length = 4)
    private String year;
    
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
    
    @Column(columnDefinition = "integer default 0")
    private Integer views;
    
    @Column(columnDefinition = "integer default 0")
    private Integer follows;
    
    @Column(columnDefinition = "decimal(3,2) default 0.0")
    private Double rating;
    
    @Column(name = "rating_count", columnDefinition = "integer default 0")
    private Integer ratingCount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", foreignKey = @ForeignKey(name = "fk_manga_author"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "mangas"})
    private Author author;
    
    @OneToMany(mappedBy = "manga", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manga"})
    private List<Chapter> chapters;
    
    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (views == null) {
            views = 0;
        }
        if (follows == null) {
            follows = 0;
        }
        if (rating == null) {
            rating = 0.0;
        }
        if (ratingCount == null) {
            ratingCount = 0;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
    
    // =====================================
    // MÉTODOS AUXILIARES PARA POSTGRESQL
    // =====================================
    
    /**
     * Obtém título no idioma preferido
     */
    public String getPreferredTitle(String preferredLanguage) {
        if (title == null || title.isEmpty()) {
            return "Título não disponível";
        }
        
        // Tenta idioma preferido -> português -> inglês -> primeiro disponível
        return title.getOrDefault(preferredLanguage,
                title.getOrDefault("pt-br",
                    title.getOrDefault("en",
                        title.values().iterator().next())));
    }
    
    /**
     * Obtém descrição no idioma preferido
     */
    public String getPreferredDescription(String preferredLanguage) {
        if (description == null || description.isEmpty()) {
            return null;
        }
        
        return description.getOrDefault(preferredLanguage,
                description.getOrDefault("pt-br",
                    description.getOrDefault("en",
                        description.values().iterator().next())));
    }
    
    /**
     * Verifica se tem título em um idioma específico
     */
    public boolean hasTitleInLanguage(String language) {
        return title != null && title.containsKey(language) && 
               title.get(language) != null && !title.get(language).trim().isEmpty();
    }
}
