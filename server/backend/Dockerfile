# ===================================================
# Reader Hub Backend - Multi-stage Docker Build
# ===================================================

# ===== Stage 1: Build =====
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copiar arquivos do Gradle primeiro (cache de dependências)
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Tornar gradlew executável
RUN chmod +x gradlew

# Baixar dependências (camada em cache)
RUN ./gradlew dependencies --no-daemon || true

# Copiar código-fonte
COPY src src

# Compilar o JAR (pular testes para builds mais rápidos)
RUN ./gradlew bootJar --no-daemon -x test

# ===== Stage 2: Runtime =====
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar o JAR compilado
COPY --from=builder /app/build/libs/*.jar app.jar

# Render/Railway injetam a variável PORT automaticamente
EXPOSE ${PORT:-8080}

# Limites de memória para free tier (512 MB no Render)
# -Xmx400m: heap máximo 400 MB | -Xms200m: heap inicial 200 MB
# G1GC: melhor para apps com memória limitada; StringDeduplication economiza heap
ENTRYPOINT ["java", "-Xmx400m", "-Xms200m", "-XX:+UseG1GC", "-XX:+UseStringDeduplication", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
