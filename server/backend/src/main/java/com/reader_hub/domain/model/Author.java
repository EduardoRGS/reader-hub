package com.reader_hub.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "authors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Author {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "en", column = @Column(name = "biography_en")),
        @AttributeOverride(name = "pt_BR", column = @Column(name = "biography_pt_br"))
    })
    private Language biography;
    
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
    
    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<Manga> mangas;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = OffsetDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
