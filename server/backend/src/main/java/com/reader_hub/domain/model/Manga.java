package com.reader_hub.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Entity
@Table(name = "mangas", indexes = {
    @Index(name = "idx_manga_api_id", columnList = "apiId"),
    @Index(name = "idx_manga_status", columnList = "status"),
    @Index(name = "idx_manga_year", columnList = "publication_year"),
    @Index(name = "idx_manga_rating", columnList = "rating"),
    @Index(name = "idx_manga_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"author", "chapters"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Manga {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true)
    private String apiId;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> title;
    
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
    
    @Column(columnDefinition = "integer")
    private Integer views;
    
    @Column(columnDefinition = "integer")
    private Integer follows;
    
    @Column(columnDefinition = "decimal(4,2)")
    private Double rating;
    
    @Column(name = "rating_count", columnDefinition = "integer")
    private Integer ratingCount;
    
    @Column(name = "cover_image", columnDefinition = "text")
    private String coverImage;
    
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
    // MÉTODOS AUXILIARES
    // =====================================
    
    /**
     * Obtém título no idioma preferido
     */
    public String getPreferredTitle(String preferredLanguage) {
        if (title == null || title.isEmpty()) {
            return "Título não disponível";
        }
        
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Manga manga = (Manga) o;
        return id != null && Objects.equals(id, manga.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
