package com.reader_hub.application.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handler global para tratamento de exceções
 * Padroniza respostas de erro em toda a aplicação
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Resposta de erro padronizada
     */
    public static class ErrorResponse {
        private final String status = "error";
        private final OffsetDateTime timestamp = OffsetDateTime.now();
        private final String message;
        private final String details;
        private final int code;

        public ErrorResponse(String message, String details, int code) {
            this.message = message;
            this.details = details;
            this.code = code;
        }

        public String getStatus() { return status; }
        public OffsetDateTime getTimestamp() { return timestamp; }
        public String getMessage() { return message; }
        public String getDetails() { return details; }
        public int getCode() { return code; }
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
     * Erro de validação de dados (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String details = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        
        log.warn("Erro de validação: {}", details);
        ErrorResponse error = new ErrorResponse(
            "Dados inválidos",
            details,
            HttpStatus.BAD_REQUEST.value()
        );
        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Erro de comunicação com API externa (502)
     */
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<ErrorResponse> handleRestClientException(RestClientException ex) {
        log.error("Erro de comunicação com API externa: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            "Erro de comunicação com serviço externo",
            "Tente novamente em alguns momentos",
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
            "Entre em contato com o suporte se o problema persistir",
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * Exceção personalizada para erros de negócio
     */
    public static class BusinessException extends RuntimeException {
        private final String details;

        public BusinessException(String message, String details) {
            super(message);
            this.details = details;
        }

        public BusinessException(String message) {
            super(message);
            this.details = null;
        }

        public String getDetails() { 
            return details != null ? details : getMessage(); 
        }
    }
} 