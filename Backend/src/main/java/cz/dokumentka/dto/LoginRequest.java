package cz.dokumentka.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Uživatelské jméno nebo email nesmí být prázdné")
    private String usernameOrEmail;

    @NotBlank(message = "Heslo nesmí být prázdné")
    private String password;
}