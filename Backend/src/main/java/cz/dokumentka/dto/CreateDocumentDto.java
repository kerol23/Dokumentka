package cz.dokumentka.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import cz.dokumentka.entity.Category;
import jakarta.validation.constraints.NotNull;

@Data
public class CreateDocumentDto {

    @NotBlank(message = "Název dokumentu nesmí být prázdný")
    @Size(min = 1, max = 100, message = "Název musí mít 1-100 znaků")
    private String name;

    @NotNull(message = "Kategorie nesmí být prázdná")
    private Category category;

    @Size(max = 500, message = "Popis může mít maximálně 500 znaků")
    private String description;

    @NotBlank(message = "Název souboru nesmí být prázdný")
    private String fileName;
}
