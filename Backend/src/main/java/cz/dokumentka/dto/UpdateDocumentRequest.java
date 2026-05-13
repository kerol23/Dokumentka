package cz.dokumentka.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import cz.dokumentka.entity.Category;

@Data
public class UpdateDocumentRequest {

    @Size(min = 1, max = 100, message = "Název musí mít 1-100 znaků")
    private String name;

    private Category category;

    @Size(max = 500, message = "Popis může mít maximálně 500 znaků")
    private String description;
}