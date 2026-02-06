package com.reader_hub.application.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MangaStatusValidator - Testes de Validação Customizada")
class MangaStatusValidatorTest {

    private MangaStatusValidator validator;

    @BeforeEach
    void setUp() {
        validator = new MangaStatusValidator();
        validator.initialize(null);
    }

    @ParameterizedTest
    @ValueSource(strings = {"ongoing", "completed", "hiatus", "cancelled"})
    @DisplayName("deve aceitar status válidos")
    void shouldAcceptValidStatuses(String status) {
        assertThat(validator.isValid(status, null)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"ONGOING", "Completed", "HIATUS", "Cancelled"})
    @DisplayName("deve aceitar status válidos case-insensitive")
    void shouldAcceptValidStatusesCaseInsensitive(String status) {
        assertThat(validator.isValid(status, null)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"invalid", "active", "finished", "dropped", "unknown", ""})
    @DisplayName("deve rejeitar status inválidos")
    void shouldRejectInvalidStatuses(String status) {
        assertThat(validator.isValid(status, null)).isFalse();
    }

    @Test
    @DisplayName("deve aceitar null (validação de null é responsabilidade de @NotNull)")
    void shouldAcceptNull() {
        assertThat(validator.isValid(null, null)).isTrue();
    }
}
