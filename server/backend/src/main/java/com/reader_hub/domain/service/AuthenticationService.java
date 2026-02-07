package com.reader_hub.domain.service;

import com.reader_hub.application.dto.AuthResponseDto;
import com.reader_hub.application.dto.LoginRequestDto;
import com.reader_hub.application.dto.RegisterRequestDto;
import com.reader_hub.domain.model.RefreshToken;
import com.reader_hub.domain.model.Role;
import com.reader_hub.domain.model.User;
import com.reader_hub.domain.repository.RefreshTokenRepository;
import com.reader_hub.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    // =====================================
    // REGISTRO
    // =====================================

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        
        // Verificar se email já está em uso
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email já está em uso.");
        }

        // Criar usuário
        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);
        log.info("Novo usuário registrado: {}", user.getEmail());

        // Gerar tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    // =====================================
    // LOGIN
    // =====================================

    @Transactional
    public AuthResponseDto login(LoginRequestDto request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Email ou senha inválidos.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Email ou senha inválidos."));

        // Revogar refresh tokens antigos
        refreshTokenRepository.revokeAllByUserId(user.getId());

        // Gerar novos tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user);

        log.info("Usuário logado: {}", user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    // =====================================
    // REFRESH TOKEN
    // =====================================

    @Transactional
    public AuthResponseDto refreshAccessToken(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new IllegalArgumentException("Refresh token não fornecido.");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token inválido."));

        if (!storedToken.isUsable()) {
            // Se o token foi revogado, revogar todos os tokens do usuário (possível roubo)
            if (storedToken.isRevoked()) {
                refreshTokenRepository.revokeAllByUserId(storedToken.getUser().getId());
                log.warn("Tentativa de reuso de refresh token revogado para usuário: {}", 
                        storedToken.getUser().getEmail());
            }
            throw new IllegalArgumentException("Refresh token expirado ou revogado.");
        }

        User user = storedToken.getUser();

        // Rotação: revogar token atual e criar novo
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = createRefreshToken(user);

        log.debug("Token renovado para usuário: {}", user.getEmail());
        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    // =====================================
    // LOGOUT
    // =====================================

    @Transactional
    public void logout(String refreshTokenValue) {
        if (refreshTokenValue != null && !refreshTokenValue.isBlank()) {
            refreshTokenRepository.findByToken(refreshTokenValue)
                    .ifPresent(token -> {
                        // Revogar todos os tokens do usuário
                        refreshTokenRepository.revokeAllByUserId(token.getUser().getId());
                        log.info("Usuário deslogado: {}", token.getUser().getEmail());
                    });
        }
    }

    // =====================================
    // MÉTODOS AUXILIARES
    // =====================================

    private String createRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString();
        
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiresAt(Instant.now().plusMillis(jwtService.getRefreshTokenExpiration()))
                .build();

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    private AuthResponseDto buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration() / 1000)
                .user(AuthResponseDto.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}
