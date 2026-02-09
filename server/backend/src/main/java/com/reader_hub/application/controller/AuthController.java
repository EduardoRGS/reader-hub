package com.reader_hub.application.controller;

import com.reader_hub.application.dto.AuthResponseDto;
import com.reader_hub.application.dto.LoginRequestDto;
import com.reader_hub.application.dto.RegisterRequestDto;
import com.reader_hub.domain.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "🔐 Autenticação", description = "Registro, login, refresh e logout")
public class AuthController {

    private final AuthenticationService authenticationService;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    // =====================================
    // REGISTRO
    // =====================================

    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta de usuário")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuário registrado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou email já em uso")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(
            @Valid @RequestBody RegisterRequestDto request,
            HttpServletResponse response) {
        
        AuthResponseDto authResponse = authenticationService.register(request);
        addRefreshTokenCookie(response, authResponse.getRefreshToken());
        
        // Remover refresh token do body (vai apenas no cookie)
        authResponse.setRefreshToken(null);
        
        return ResponseEntity.ok(authResponse);
    }

    // =====================================
    // LOGIN
    // =====================================

    @Operation(summary = "Login", description = "Autentica o usuário e retorna tokens JWT")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
        @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletResponse response) {
        
        AuthResponseDto authResponse = authenticationService.login(request);
        addRefreshTokenCookie(response, authResponse.getRefreshToken());
        
        // Remover refresh token do body (vai apenas no cookie)
        authResponse.setRefreshToken(null);
        
        return ResponseEntity.ok(authResponse);
    }

    // =====================================
    // REFRESH TOKEN
    // =====================================

    @Operation(summary = "Renovar access token", description = "Usa o refresh token (cookie) para gerar um novo access token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token renovado com sucesso"),
        @ApiResponse(responseCode = "401", description = "Refresh token inválido ou expirado")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        
        String refreshToken = extractRefreshTokenFromCookie(request);
        AuthResponseDto authResponse = authenticationService.refreshAccessToken(refreshToken);
        
        // Rotação: novo refresh token no cookie
        addRefreshTokenCookie(response, authResponse.getRefreshToken());
        authResponse.setRefreshToken(null);
        
        return ResponseEntity.ok(authResponse);
    }

    // =====================================
    // LOGOUT
    // =====================================

    @Operation(summary = "Logout", description = "Revoga o refresh token e limpa o cookie")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Logout realizado com sucesso")
    })
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        
        String refreshToken = extractRefreshTokenFromCookie(request);
        authenticationService.logout(refreshToken);
        
        // Limpar cookie
        clearRefreshTokenCookie(response);
        
        return ResponseEntity.ok(Map.of("message", "Logout realizado com sucesso."));
    }

    // =====================================
    // ME (dados do usuário autenticado)
    // =====================================

    @Operation(summary = "Dados do usuário", description = "Retorna os dados do usuário autenticado")
    @GetMapping("/me")
    public ResponseEntity<AuthResponseDto.UserDto> me(
            @org.springframework.security.core.annotation.AuthenticationPrincipal
            com.reader_hub.domain.model.User user) {
        
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        return ResponseEntity.ok(AuthResponseDto.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build());
    }

    // =====================================
    // COOKIE HELPERS
    // =====================================

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        boolean isProd = "prod".equals(activeProfile);
        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(isProd);  // true em produção (HTTPS obrigatório)
        cookie.setPath("/api/auth");
        cookie.setMaxAge((int) (refreshTokenExpiration / 1000));
        // Cross-domain (Vercel→Render) exige SameSite=None + Secure
        cookie.setAttribute("SameSite", isProd ? "None" : "Lax");
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        boolean isProd = "prod".equals(activeProfile);
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(isProd);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", isProd ? "None" : "Lax");
        response.addCookie(cookie);
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> "refresh_token".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
