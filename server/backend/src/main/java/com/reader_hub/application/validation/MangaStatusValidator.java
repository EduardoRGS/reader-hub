package com.reader_hub.application.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

/**
 * Implementação do validador para status de manga
 */
public class MangaStatusValidator implements ConstraintValidator<ValidMangaStatus, String> {
    
    private static final Set<String> VALID_STATUSES = Set.of(
        "ongoing", "completed", "hiatus", "cancelled"
    );
    
    @Override
    public void initialize(ValidMangaStatus constraintAnnotation) {
        // Inicialização se necessário
    }
    
    @Override
    public boolean isValid(String status, ConstraintValidatorContext context) {
        if (status == null) {
            return true; // @NotNull deve ser usado separadamente
        }
        
        return VALID_STATUSES.contains(status.toLowerCase());
    }
} 