package com.reader_hub.application.exception;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Resposta de erro padronizada para toda a aplicação.
 */
public class ErrorResponse {

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

    public String getStatus() {
        return status;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public String getDetails() {
        return details;
    }

    public int getCode() {
        return code;
    }

    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }
}
