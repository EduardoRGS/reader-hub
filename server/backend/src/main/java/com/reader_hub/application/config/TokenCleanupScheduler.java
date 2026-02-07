package com.reader_hub.application.config;

import com.reader_hub.domain.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Limpeza periódica de refresh tokens expirados.
 * Executa a cada 6 horas para evitar acúmulo no banco.
 */
@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(fixedRate = 6 * 60 * 60 * 1000) // 6 horas
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteAllExpired();
        log.debug("Limpeza de refresh tokens expirados concluída.");
    }
}
