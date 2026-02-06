package com.reader_hub.application.exception;

/**
 * Exceção para erros de comunicação com APIs externas.
 * Resulta em HTTP 502 (Bad Gateway).
 */
public class ExternalApiException extends RuntimeException {

    private final String serviceName;

    public ExternalApiException(String serviceName, String message) {
        super(String.format("Erro ao comunicar com %s: %s", serviceName, message));
        this.serviceName = serviceName;
    }

    public ExternalApiException(String serviceName, String message, Throwable cause) {
        super(String.format("Erro ao comunicar com %s: %s", serviceName, message), cause);
        this.serviceName = serviceName;
    }

    public String getServiceName() {
        return serviceName;
    }
}
