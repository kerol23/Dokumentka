package cz.dokumentka.controller;

import cz.dokumentka.dto.CreateDocumentDto;
import cz.dokumentka.dto.DocumentDto;
import cz.dokumentka.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cz.dokumentka.dto.UpdateDocumentRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<DocumentDto>> getAllDocumentsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(documentService.getAllDocumentsPaged(page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DocumentDto>> searchDocuments(
            @RequestParam String query) {
        return ResponseEntity.ok(documentService.searchDocuments(query));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<DocumentDto>> getByCategory(
            @PathVariable String category) {
        return ResponseEntity.ok(documentService.getDocumentsByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @PostMapping
    public ResponseEntity<DocumentDto> createDocument(@Valid @RequestBody CreateDocumentDto dto) {
        return ResponseEntity.ok(documentService.saveDocument(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentDto> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDocumentRequest request) {
        return ResponseEntity.ok(documentService.updateDocument(id, request));
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<DocumentDto> uploadFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(documentService.uploadFile(id, file));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        byte[] fileData = documentService.downloadFile(id);
        DocumentDto document = documentService.getDocumentById(id);

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=\"" + document.getFileName() + "\"")
                .body(fileData);
    }
}