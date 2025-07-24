package com.reader_hub.application.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.util.Map;

/**
 * DTO para criação manual de autores com validações
 * Usado quando o usuário cria autores diretamente, não via API externa
 */
@Data
public class CreateAuthorDto {

    @NotBlank(message = "{author.name.required}")
    @Size(min = 2, max = 100, message = "{author.name.size}")
    private String name;

    @Size(max = 2000, message = "{common.description.size}")
    private String biography;

    // Validações aplicadas apenas se o campo não for null/vazio
    @Email(message = "{common.email.format}")
    private String email;

    @URL(message = "{common.url.format}")
    private String website;

    @Pattern(regexp = "^$|^https?://twitter\\.com/.*", message = "{social.twitter.format}")
    private String twitter;

    @Pattern(regexp = "^$|^https?://.*pixiv\\.net/.*", message = "{social.pixiv.format}")
    private String pixiv;

    // Biografias multi-idioma opcionais
    private Map<String, String> biographies;

    // Links sociais opcionais
    private Map<String, String> socialLinks;
} 