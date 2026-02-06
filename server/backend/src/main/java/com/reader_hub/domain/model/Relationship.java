package com.reader_hub.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Objects;

@Entity
@Table(name = "relationships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Relationship {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String internalId;
    
    @Column(nullable = false)
    private String id;

    @Column(nullable = false)
    private String type;
    
    private String related;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Relationship that = (Relationship) o;
        return internalId != null && Objects.equals(internalId, that.internalId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
