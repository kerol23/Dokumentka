package cz.dokumentka.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Uživatelské jméno nesmí být prázdné")
    @Size(min = 3, max = 50, message = "Uživatelské jméno musí mít 3-50 znaků")
    private String username;

    @NotBlank(message = "Email nesmí být prázdný")
    @Email(message = "Email musí být ve správném formátu")
    private String email;

    @NotBlank(message = "Heslo nesmí být prázdné")
    @Size(min = 6, message = "Heslo musí mít alespoň 6 znaků")
    private String password;
}