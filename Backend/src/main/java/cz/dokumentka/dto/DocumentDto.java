package cz.dokumentka.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DocumentDto {

    private Long id;
    private String name;
    private String category;
    private String description;
    private String fileName;
    private LocalDateTime uploadedAt;
}