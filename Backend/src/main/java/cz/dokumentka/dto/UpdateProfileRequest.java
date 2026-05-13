package cz.dokumentka.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Email(message = "Email musí být ve správném formátu")
    private String email;

    @Size(min = 6, message = "Heslo musí mít alespoň 6 znaků")
    private String newPassword;

    private String currentPassword;

    @Size(min = 3, max = 50, message = "Uživatelské jméno musí mít 3-50 znaků")
    private String username;
}