package com.reader_hub.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "mangas")
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
    
    @ElementCollection
    @CollectionTable(name = "manga_titles", joinColumns = @JoinColumn(name = "manga_id"))
    @MapKeyColumn(name = "language")
    @Column(name = "title")
    private Map<String, String> title;
    
    @ElementCollection
    @CollectionTable(name = "manga_descriptions", joinColumns = @JoinColumn(name = "manga_id"))
    @MapKeyColumn(name = "language")
    @Column(name = "description", columnDefinition = "TEXT")
    private Map<String, String> description;
    
    @Column(nullable = false)
    private String status;
    
    @Column(name = "publication_year")
    private String year;
    
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
    
    private Integer views;
    private Integer follows;
    private Double rating;
    
    @Column(name = "rating_count")
    private Integer ratingCount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "mangas"})
    private Author author;
    
    @OneToMany(mappedBy = "manga", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manga"})
    private List<Chapter> chapters;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = OffsetDateTime.now();
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
}
