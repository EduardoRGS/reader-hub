package com.reader_hub.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "relationships")
@NoArgsConstructor
@AllArgsConstructor
public class Relationship {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String internalId;
    
    @Column(nullable = false)
    private String id; // ID do recurso relacionado (manga, author, etc.)

    @Column(nullable = false)
    private String type; // tipo de relacionamento (manga, author, artist, cover_art, etc.)
    
    private String related; // usado em alguns casos especiais
}
