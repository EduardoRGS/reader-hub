package com.reader_hub.application.config;

import com.reader_hub.domain.model.Role;
import com.reader_hub.domain.model.User;
import com.reader_hub.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Inicializador que cria o usuário ADMIN padrão na primeira execução.
 * As credenciais são configuráveis via variáveis de ambiente.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@readerhub.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.admin.name:Administrador}")
    private String adminName;

    @Override
    public void run(String... args) {
        // Só cria se não existir nenhum admin
        if (!userRepository.existsByRole(Role.ADMIN)) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);
            log.info("✅ Usuário ADMIN criado: {}", adminEmail);
        } else {
            log.info("ℹ️  Usuário ADMIN já existe.");
        }
    }
}
