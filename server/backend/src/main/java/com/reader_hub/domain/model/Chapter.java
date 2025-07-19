package com.reader_hub.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "chapters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chapter {
    
    @Id
    private String id;
    
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
}
