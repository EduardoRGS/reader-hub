package com.reader_hub.application.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.client.RestClientException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("GlobalExceptionHandler - Testes Unitários")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("deve retornar 400 para erros de validação (MethodArgumentNotValid)")
    void shouldReturn400ForValidationErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        FieldError fieldError = new FieldError("dto", "title", "Título é obrigatório");
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<ErrorResponse> response = handler.handleValidationException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(400);
        assertThat(response.getBody().getValidationErrors()).containsKey("title");
        assertThat(response.getBody().getValidationErrors().get("title")).isEqualTo("Título é obrigatório");
    }

    @Test
    @DisplayName("deve retornar 404 para ResourceNotFoundException")
    void shouldReturn404ForResourceNotFound() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Manga", "ID", "abc-123");

        ResponseEntity<ErrorResponse> response = handler.handleResourceNotFoundException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(404);
        assertThat(response.getBody().getMessage()).isEqualTo("Recurso não encontrado");
    }

    @Test
    @DisplayName("deve retornar 409 para DuplicateResourceException")
    void shouldReturn409ForDuplicateResource() {
        DuplicateResourceException ex = new DuplicateResourceException("Manga", "apiId", "ext-123");

        ResponseEntity<ErrorResponse> response = handler.handleDuplicateResourceException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(409);
        assertThat(response.getBody().getMessage()).isEqualTo("Recurso já existe");
    }

    @Test
    @DisplayName("deve retornar 502 para ExternalApiException")
    void shouldReturn502ForExternalApiException() {
        ExternalApiException ex = new ExternalApiException("MangaDex", "Timeout ao conectar");

        ResponseEntity<ErrorResponse> response = handler.handleExternalApiException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(502);
    }

    @Test
    @DisplayName("deve retornar 502 para RestClientException")
    void shouldReturn502ForRestClientException() {
        RestClientException ex = new RestClientException("Connection refused");

        ResponseEntity<ErrorResponse> response = handler.handleRestClientException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(502);
    }

    @Test
    @DisplayName("deve retornar 422 para BusinessException")
    void shouldReturn422ForBusinessException() {
        BusinessException ex = new BusinessException("Operação não permitida", "Rating não pode ser negativo");

        ResponseEntity<ErrorResponse> response = handler.handleBusinessException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(422);
        assertThat(response.getBody().getMessage()).isEqualTo("Operação não permitida");
        assertThat(response.getBody().getDetails()).isEqualTo("Rating não pode ser negativo");
    }

    @Test
    @DisplayName("deve retornar 400 para IllegalArgumentException")
    void shouldReturn400ForIllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Parâmetro inválido");

        ResponseEntity<ErrorResponse> response = handler.handleIllegalArgumentException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).isEqualTo("Dados inválidos");
    }

    @Test
    @DisplayName("deve retornar 500 para exceção genérica")
    void shouldReturn500ForGenericException() {
        Exception ex = new RuntimeException("Erro inesperado");

        ResponseEntity<ErrorResponse> response = handler.handleGenericException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(500);
        assertThat(response.getBody().getMessage()).isEqualTo("Erro interno do servidor");
    }

    @Test
    @DisplayName("ErrorResponse deve ter status 'error' e timestamp não nulo")
    void errorResponseShouldHaveCorrectDefaults() {
        ErrorResponse error = new ErrorResponse("Teste", "Detalhes", 400);

        assertThat(error.getStatus()).isEqualTo("error");
        assertThat(error.getTimestamp()).isNotNull();
        assertThat(error.getMessage()).isEqualTo("Teste");
        assertThat(error.getDetails()).isEqualTo("Detalhes");
        assertThat(error.getCode()).isEqualTo(400);
        assertThat(error.getValidationErrors()).isEmpty();
    }
}
