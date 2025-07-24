package com.reader_hub.application.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "💚 Health", description = "Verificação de saúde da aplicação")
public class HealthController {

    @Operation(
        summary = "Verificar saúde da aplicação",
        description = "Endpoint simples para verificar se a aplicação está funcionando"
    )
    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Aplicação funcionando corretamente",
            "timestamp", java.time.Instant.now().toString()
        ));
    }
} 