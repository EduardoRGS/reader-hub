package com.reader_hub.application.exception;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handler global para tratamento de exceções
 * Padroniza respostas de erro em toda a aplicação com validações aprimoradas
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Resposta de erro padronizada usando Lombok
     */
    @Data
    public static class ErrorResponse {
        private final String status = "error";
        private final OffsetDateTime timestamp = OffsetDateTime.now();
        private final String message;
        private final String details;
        private final int code;
        private final Map<String, String> validationErrors;

        public ErrorResponse(String message, String details, int code) {
            this.message = message;
            this.details = details;
            this.code = code;
            this.validationErrors = new HashMap<>();
        }

        public ErrorResponse(String message, String details, int code, Map<String, String> validationErrors) {
            this.message = message;
            this.details = details;
            this.code = code;
            this.validationErrors = validationErrors != null ? validationErrors : new HashMap<>();
        }
    }

    /**
     * Tratamento aprimorado para erros de validação em DTOs (@Valid)
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
     * Tratamento para violações de constraint (@Valid em parâmetros)
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
     * Entidade não encontrada (404)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Erro de validação: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            "Recurso não encontrado ou dados inválidos",
            ex.getMessage(),
            HttpStatus.NOT_FOUND.value()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Erro de comunicação com API externa (502)
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
     * Exceções de negócio personalizadas
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

    /**
     * Exceção personalizada para erros de negócio usando Lombok
     */
    @Data
    public static class BusinessException extends RuntimeException {
        private final String details;

        public BusinessException(String message, String details) {
            super(message);
            this.details = details;
        }

        public BusinessException(String message) {
            super(message);
            this.details = message;
        }

        public String getDetails() { 
            return details != null ? details : getMessage(); 
        }
    }
} 