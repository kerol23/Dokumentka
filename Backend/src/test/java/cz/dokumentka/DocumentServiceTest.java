package cz.dokumentka;

import cz.dokumentka.dto.CreateDocumentDto;
import cz.dokumentka.dto.DocumentDto;
import cz.dokumentka.entity.Document;
import cz.dokumentka.repository.DocumentRepository;
import cz.dokumentka.service.DocumentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @InjectMocks
    private DocumentService documentService;

    @Test
    void saveDocument_shouldReturnSavedDocument() {
        // Připravíme vstupní data
        CreateDocumentDto dto = new CreateDocumentDto();
        dto.setName("Pracovní smlouva");
        dto.setCategory("PRACE");
        dto.setDescription("Smlouva od ledna 2024");
        dto.setFileName("smlouva.pdf");

        // Připravíme co vrátí repository
        Document savedDocument = new Document();
        savedDocument.setId(1L);
        savedDocument.setName("Pracovní smlouva");
        savedDocument.setCategory("PRACE");
        savedDocument.setDescription("Smlouva od ledna 2024");
        savedDocument.setFileName("smlouva.pdf");

        when(documentRepository.save(any(Document.class))).thenReturn(savedDocument);

        // Zavoláme metodu
        DocumentDto result = documentService.saveDocument(dto);

        // Ověříme výsledek
        assertNotNull(result);
        assertEquals("Pracovní smlouva", result.getName());
        assertEquals("PRACE", result.getCategory());
        verify(documentRepository, times(1)).save(any(Document.class));
    }

    @Test
    void getAllDocuments_shouldReturnListOfDocuments() {
        Document doc = new Document();
        doc.setId(1L);
        doc.setName("Faktura");
        doc.setCategory("FAKTURY");
        doc.setFileName("faktura.pdf");

        when(documentRepository.findAll()).thenReturn(List.of(doc));

        List<DocumentDto> result = documentService.getAllDocuments();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Faktura", result.get(0).getName());
    }

    @Test
    void getDocumentById_shouldThrowException_whenNotFound() {
        when(documentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            documentService.getDocumentById(99L);
        });
    }
}