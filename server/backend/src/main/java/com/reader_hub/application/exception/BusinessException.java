package com.reader_hub.application.exception;

/**
 * Exceção para erros de regra de negócio.
 * Resulta em HTTP 422 (Unprocessable Entity).
 */
public class BusinessException extends RuntimeException {

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
