package com.reader_hub.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {

    @NotBlank(message = "Email é obrigatório.")
    @Email(regexp = ".+@.+\\..+", message = "Email deve ser válido.")
    private String email;

    @NotBlank(message = "Senha é obrigatória.")
    @Size(min = 8, max = 32, message = "Senha deve ter entre 8 e 32 caracteres.")
    private String password;
}
