package com.reader_hub.application.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validação customizada para status de manga
 * Aceita apenas: ongoing, completed, hiatus, cancelled
 */
@Documented
@Constraint(validatedBy = MangaStatusValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidMangaStatus {
    String message() default "{manga.status.valid}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
} 