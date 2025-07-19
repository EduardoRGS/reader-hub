package com.reader_hub.domain.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Language {
    private String en;
    private String pt_BR;
}
