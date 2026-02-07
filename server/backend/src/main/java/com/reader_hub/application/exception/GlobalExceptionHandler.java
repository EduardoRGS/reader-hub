package com.reader_hub.application.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handler global para tratamento de exceções.
 * Padroniza respostas de erro em toda a aplicação.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Tratamento para erros de validação em DTOs (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        String summary = String.format("Encontrados %d erro(s) de validação", errors.size());
        String details = errors.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining("; "));

        log.warn("Erros de validação: {}", details);

        ErrorResponse error = new ErrorResponse(summary, details, HttpStatus.BAD_REQUEST.value(), errors);
        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Tratamento para violações de constraint (@Validated em parâmetros)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();

        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        }

        String summary = String.format("Encontrados %d erro(s) de validação de parâmetros", errors.size());
        String details = errors.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining("; "));

        log.warn("Violações de constraint: {}", details);

        ErrorResponse error = new ErrorResponse(summary, details, HttpStatus.BAD_REQUEST.value(), errors);
        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Tratamento para tipos de argumentos incompatíveis
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatchException(MethodArgumentTypeMismatchException ex) {
        String fieldName = ex.getName();
        String invalidValue = ex.getValue() != null ? ex.getValue().toString() : "null";
        String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "Unknown";

        Map<String, String> errors = new HashMap<>();
        errors.put(fieldName, String.format("Valor '%s' é inválido. Esperado tipo: %s", invalidValue, requiredType));

        log.warn("Erro de tipo: campo '{}' com valor '{}' não pode ser convertido para {}",
                fieldName, invalidValue, requiredType);

        ErrorResponse error = new ErrorResponse(
                "Tipo de dados inválido",
                String.format("Parâmetro '%s' possui tipo inválido", fieldName),
                HttpStatus.BAD_REQUEST.value(),
                errors
        );

        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Recurso não encontrado (404)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.warn("Recurso não encontrado: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
                "Recurso não encontrado",
                ex.getMessage(),
                HttpStatus.NOT_FOUND.value()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Recurso duplicado (409)
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(DuplicateResourceException ex) {
        log.warn("Recurso duplicado: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
                "Recurso já existe",
                ex.getMessage(),
                HttpStatus.CONFLICT.value()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Erro de comunicação com API externa (502)
     */
    @ExceptionHandler(ExternalApiException.class)
    public ResponseEntity<ErrorResponse> handleExternalApiException(ExternalApiException ex) {
        log.error("Erro de comunicação com API externa: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
                "Erro de comunicação com serviço externo",
                "Tente novamente em alguns momentos. Se o problema persistir, verifique a conectividade.",
                HttpStatus.BAD_GATEWAY.value()
        );
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);
    }

    /**
     * Erro de comunicação com API externa via RestClient (502)
     */
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<ErrorResponse> handleRestClientException(RestClientException ex) {
        log.error("Erro de comunicação com API externa: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
                "Erro de comunicação com serviço externo",
                "Tente novamente em alguns momentos. Se o problema persistir, verifique a conectividade.",
                HttpStatus.BAD_GATEWAY.value()
        );
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);
    }

    /**
     * Exceções de negócio personalizadas (422)
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        log.warn("Erro de negócio: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
                ex.getMessage(),
                ex.getDetails(),
                HttpStatus.UNPROCESSABLE_ENTITY.value()
        );
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    /**
     * Credenciais inválidas (401)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        log.warn("Tentativa de login com credenciais inválidas");
        ErrorResponse error = new ErrorResponse(
                "Credenciais inválidas",
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED.value()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Acesso negado (403)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Acesso negado: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
                "Acesso negado",
                "Você não tem permissão para acessar este recurso.",
                HttpStatus.FORBIDDEN.value()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Violação de integridade do banco de dados (409 Conflict)
     * Ex.: email duplicado em registro concorrente
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        log.warn("Violação de integridade: {}", ex.getMostSpecificCause().getMessage());
        ErrorResponse error = new ErrorResponse(
                "Conflito de dados",
                "O recurso já existe ou viola uma restrição do banco de dados.",
                HttpStatus.CONFLICT.value()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Argumento ilegal - mapeado para 400 (Bad Request), não 404
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Argumento inválido: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
                "Dados inválidos",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value()
        );
        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Erro genérico interno (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Erro interno do servidor", ex);
        ErrorResponse error = new ErrorResponse(
                "Erro interno do servidor",
                "Entre em contato com o suporte se o problema persistir. Código de referência: " +
                        java.util.UUID.randomUUID().toString().substring(0, 8),
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
