package cz.dokumentka.service;

import cz.dokumentka.dto.CreateDocumentDto;
import cz.dokumentka.dto.DocumentDto;
import cz.dokumentka.entity.Document;
import cz.dokumentka.entity.User;
import cz.dokumentka.repository.DocumentRepository;
import cz.dokumentka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import cz.dokumentka.dto.UpdateDocumentRequest;
import org.springframework.web.multipart.MultipartFile;
import cz.dokumentka.entity.Category;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    private static final int BASIC_DOCUMENT_LIMIT = 10;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Uživatel nenalezen"));
    }

    public List<DocumentDto> getAllDocuments() {
        User user = getCurrentUser();
        log.info("Fetching all documents for user: {}", user.getUsername());
        return documentRepository.findByOwner(user)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public Page<DocumentDto> getAllDocumentsPaged(int page, int size) {
        User user = getCurrentUser();
        log.info("Fetching paged documents for user: {}", user.getUsername());
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());
        return documentRepository.findByOwner(user, pageable).map(this::toDto);
    }

    public DocumentDto getDocumentById(Long id) {
        log.info("Fetching document with id: {}", id);
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Document with id {} not found", id);
                    return new RuntimeException("Dokument nenalezen s id: " + id);
                });
        return toDto(document);
    }

    public List<DocumentDto> searchDocuments(String query) {
        User user = getCurrentUser();
        log.info("Searching documents for user: {} with query: {}", user.getUsername(), query);
        return documentRepository.searchByOwnerAndNameOrDescription(user, query)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<DocumentDto> getDocumentsByCategory(String category) {
        User user = getCurrentUser();
        log.info("Fetching documents by category: {} for user: {}", category, user.getUsername());
        Category cat = Category.valueOf(category);
        return documentRepository.findByOwnerAndCategory(user, cat)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public DocumentDto saveDocument(CreateDocumentDto dto) {
        User user = getCurrentUser();

        // Kontrola limitu pro Basic plán
        if (user.getPlan() == User.Plan.BASIC) {
            long count = documentRepository.countByOwner(user);
            if (count >= BASIC_DOCUMENT_LIMIT) {
                log.warn("User {} reached Basic plan limit", user.getUsername());
                throw new RuntimeException(
                        "Dosáhli jste limitu " + BASIC_DOCUMENT_LIMIT +
                                " dokumentů pro Basic plán. Přejděte na Premium pro neomezený počet dokumentů.");
            }
        }

        log.info("Saving document: {} for user: {}", dto.getName(), user.getUsername());
        Document document = toEntity(dto);
        document.setOwner(user);
        return toDto(documentRepository.save(document));
    }

    public void deleteDocument(Long id) {
        log.info("Deleting document with id: {}", id);
        documentRepository.deleteById(id);
    }

    public DocumentDto updateDocument(Long id, UpdateDocumentRequest request) {
        User user = getCurrentUser();
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Document with id {} not found", id);
                    return new RuntimeException("Dokument nenalezen s id: " + id);
                });

        // Kontrola že dokument patří přihlášenému uživateli
        if (!document.getOwner().getId().equals(user.getId())) {
            log.warn("User {} tried to update document {} which is not theirs",
                    user.getUsername(), id);
            throw new RuntimeException("Nemáte oprávnění upravovat tento dokument");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            document.setName(request.getName());
        }
        if (request.getCategory() != null) {
            document.setCategory(request.getCategory());
        }

        if (request.getDescription() != null) {
            document.setDescription(request.getDescription());
        }

        log.info("Document {} updated by user {}", id, user.getUsername());
        return toDto(documentRepository.save(document));
    }

    public DocumentDto uploadFile(Long id, MultipartFile file) {
        User user = getCurrentUser();
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dokument nenalezen s id: " + id));

        if (!document.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Nemáte oprávnění upravovat tento dokument");
        }

        // Smaž starý soubor pokud existuje
        if (document.getFilePath() != null) {
            fileStorageService.deleteFile(document.getFilePath());
        }

        // Ulož nový soubor
        String fileName = fileStorageService.storeFile(file);
        document.setFilePath(fileName);
        document.setFileType(file.getContentType());
        document.setFileName(file.getOriginalFilename());

        log.info("File uploaded for document {} by user {}", id, user.getUsername());
        return toDto(documentRepository.save(document));
    }

    public byte[] downloadFile(Long id) {
        User user = getCurrentUser();
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dokument nenalezen s id: " + id));

        if (!document.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Nemáte oprávnění stáhnout tento dokument");
        }

        if (document.getFilePath() == null) {
            throw new RuntimeException("Dokument nemá nahraný soubor");
        }

        return fileStorageService.loadFile(document.getFilePath());
    }

    private DocumentDto toDto(Document document) {
        DocumentDto dto = new DocumentDto();
        dto.setId(document.getId());
        dto.setName(document.getName());
        dto.setCategory(document.getCategory().name());
        dto.setDescription(document.getDescription());
        dto.setFileName(document.getFileName());
        dto.setUploadedAt(document.getUploadedAt());
        return dto;
    }

    private Document toEntity(CreateDocumentDto dto) {
        Document document = new Document();
        document.setName(dto.getName());
        document.setCategory(dto.getCategory());
        document.setDescription(dto.getDescription());
        document.setFileName(dto.getFileName());
        return document;
    }
}