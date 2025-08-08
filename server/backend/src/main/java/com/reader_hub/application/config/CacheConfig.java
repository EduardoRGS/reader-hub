package com.reader_hub.application.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${app.redis.enabled:false}")
    private boolean redisEnabled;

    @Bean
    @Primary
    @ConditionalOnProperty(name = "app.redis.enabled", havingValue = "true")
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        try {
            connectionFactory.getConnection().ping();
            log.info("✅ Redis conectado com sucesso. Usando RedisCacheManager.");
            return createRedisCacheManager(connectionFactory);
        } catch (Exception e) {
            log.warn("⚠️  Redis indisponível: {}. Fazendo fallback para cache em memória.", e.getMessage());
            // Fallback automático para cache em memória
            return createSimpleCacheManager();
        }
    }

    @Bean
    @Primary
    @ConditionalOnProperty(name = "app.redis.enabled", havingValue = "false", matchIfMissing = true)
    public CacheManager simpleCacheManager() {
        log.info("📝 Redis desabilitado. Usando cache em memória (ConcurrentMapCacheManager).");
        return createSimpleCacheManager();
    }

    private CacheManager createRedisCacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(serializer))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        cacheConfigurations.put("mangas", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("manga-lists", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("statistics", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("authors", defaultConfig.entryTtl(Duration.ofHours(2)));
        cacheConfigurations.put("external-api", defaultConfig.entryTtl(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }

    private CacheManager createSimpleCacheManager() {
        return new ConcurrentMapCacheManager(
                "mangas", "manga-lists", "statistics", "authors", "external-api"
        );
    }
}