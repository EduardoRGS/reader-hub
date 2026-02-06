package com.reader_hub.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "chapters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"manga", "images"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Chapter {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String apiId;
    
    private String title;
    private String volume;
    private String chapter;
    private Integer pages;
    private String status;
    private String language;
    
    @Column(name = "published_at")
    private OffsetDateTime publishedAt;
    
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
    
    @Column(name = "readable_at")
    private OffsetDateTime readableAt;
    
    private Integer views;
    private Integer comments;
    
    @ElementCollection
    @CollectionTable(name = "chapter_images", joinColumns = @JoinColumn(name = "chapter_id"))
    @Column(name = "image_url")
    private List<String> images;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manga_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "chapters"})
    private Manga manga;
    
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
        if (comments == null) {
            comments = 0;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Chapter chapter = (Chapter) o;
        return id != null && Objects.equals(id, chapter.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
