package com.innovision.productivityhub.controller;

// Import necessary classes
import com.innovision.productivityhub.dto.DocumentDTO;
import com.innovision.productivityhub.dto.DocumentVersionDTO;
import com.innovision.productivityhub.model.Document;
import com.innovision.productivityhub.model.DocumentVersion;
import com.innovision.productivityhub.repository.DocumentRepository;
import com.innovision.productivityhub.repository.DocumentVersionRepository;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.service.DocumentService;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Marks this class as REST controller to handle HTTP requests
@RestController
@RequestMapping("/api/documents") // Base URL for all document-related APIs
public class DocumentController {

    // Dependencies (Service + Repositories)
    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final ProjectRepository projectRepository;

    // Constructor injection (Spring automatically injects beans)
    public DocumentController(DocumentService documentService,
                              DocumentRepository documentRepository,
                              DocumentVersionRepository documentVersionRepository,
                              ProjectRepository projectRepository) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
        this.documentVersionRepository = documentVersionRepository;
        this.projectRepository = projectRepository;
    }

    // -----------------------
    // 1️⃣ Get all documents for a project
    // GET /api/documents/project/{projectId}
    // -----------------------
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Document>> byProject(@PathVariable Long projectId) {
        // Calls service to fetch all documents linked to a project
        return ResponseEntity.ok(documentService.byProject(projectId));
    }

    // -----------------------
    // 2️⃣ Create a new document (basic version)
    // POST /api/documents/project/{projectId}
    // -----------------------
    @PostMapping("/project/{projectId}")
    public ResponseEntity<Document> create(@PathVariable Long projectId,
                                           @RequestBody String content,
                                           Principal principal) {
        // Principal provides current logged-in user email
        String email = principal != null ? principal.getName() : null;

        // Calls service to create a document with default title "Untitled Doc"
        return ResponseEntity.ok(
            documentService.create(projectId, "Untitled Doc", content, email)
        );
    }

    // -----------------------
    // 3️⃣ Create a document using DTO (structured input)
    // POST /api/documents
    // -----------------------
    @PostMapping
    public ResponseEntity<DocumentDTO> createDocument(@RequestBody DocumentDTO dto) {
        try {
            // Fetch project entity for linking
            var project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Create new Document entity
            Document doc = new Document();
            doc.setTitle(dto.getTitle());
            doc.setContent(dto.getContent() != null ? dto.getContent() : "");
            doc.setProject(project);

            // Save document to DB
            Document saved = documentRepository.save(doc);

            // Convert to DTO and return with HTTP 201
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // -----------------------
    // 4️⃣ Update a document (basic content update)
    // PUT /api/documents/{id}
    // -----------------------
    @PutMapping("/{id}")
    public ResponseEntity<Document> update(@PathVariable Long id,
                                           @RequestBody String content,
                                           Principal principal) {
        String email = principal != null ? principal.getName() : null;

        // Calls service to update document content
        return ResponseEntity.ok(documentService.update(id, content, email));
    }

    // -----------------------
    // 5️⃣ Update document and create version (version control)
    // PUT /api/documents/{docId}
    // -----------------------
    @PutMapping("/{docId}")
    public ResponseEntity<DocumentDTO> updateDocument(
            @PathVariable Long docId,
            @RequestBody DocumentDTO dto) {
        try {
            // Fetch existing document
            Document doc = documentRepository.findById(docId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Save current version before updating
            if (!doc.getContent().isEmpty()) {
                DocumentVersion version = new DocumentVersion();
                version.setDocument(doc);
                version.setContent(doc.getContent());

                // Determine next version number
                List<DocumentVersion> existing = documentVersionRepository
                        .findByDocumentIdOrderByVersionNumberDesc(docId);
                version.setVersionNumber(existing.isEmpty() ? 1 : existing.get(0).getVersionNumber() + 1);

                // Optional description of change
                version.setChangeDescription(dto.getChangeDescription() != null ? 
                        dto.getChangeDescription() : "Updated");

                // Save version in DB
                documentVersionRepository.save(version);
            }

            // Update document content and title
            doc.setTitle(dto.getTitle());
            doc.setContent(dto.getContent());
            Document updated = documentRepository.save(doc);

            // Return updated document as DTO
            return ResponseEntity.ok(convertToDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // -----------------------
    // 6️⃣ Delete a document
    // DELETE /api/documents/{docId}
    // -----------------------
    @DeleteMapping("/{docId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long docId) {
        try {
            // Fetch document
            Document doc = documentRepository.findById(docId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Delete all versions first (clean DB)
            documentVersionRepository.deleteAll(
                    documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(docId)
            );

            // Delete document itself
            documentRepository.delete(doc);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // -----------------------
    // 7️⃣ Get version history for a document
    // GET /api/documents/{docId}/versions
    // -----------------------
    @GetMapping("/{docId}/versions")
    public ResponseEntity<List<DocumentVersionDTO>> getDocumentVersions(@PathVariable Long docId) {
        try {
            List<DocumentVersion> versions = documentVersionRepository
                    .findByDocumentIdOrderByVersionNumberDesc(docId);

            if (versions == null || versions.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            // Convert each version to DTO
            List<DocumentVersionDTO> dtos = versions.stream()
                    .map(this::convertVersionToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // -----------------------
    // 8️⃣ Restore a document to a previous version
    // POST /api/documents/{docId}/restore/{versionNumber}
    // -----------------------
    @PostMapping("/{docId}/restore/{versionNumber}")
    public ResponseEntity<DocumentDTO> restoreVersion(
            @PathVariable Long docId,
            @PathVariable Integer versionNumber) {
        try {
            // Fetch document
            Document doc = documentRepository.findById(docId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Get version history
            List<DocumentVersion> versions = documentVersionRepository
                    .findByDocumentIdOrderByVersionNumberDesc(docId);

            // Find the version to restore
            DocumentVersion targetVersion = versions.stream()
                    .filter(v -> v.getVersionNumber() == versionNumber)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Version not found"));

            // Save current version before restoring
            DocumentVersion currentVersion = new DocumentVersion();
            currentVersion.setDocument(doc);
            currentVersion.setContent(doc.getContent());
            currentVersion.setVersionNumber(versions.isEmpty() ? 1 : 
                    versions.get(0).getVersionNumber() + 1);
            currentVersion.setChangeDescription("Restored from version " + versionNumber);
            documentVersionRepository.save(currentVersion);

            // Restore document content
            doc.setContent(targetVersion.getContent());
            Document restored = documentRepository.save(doc);

            return ResponseEntity.ok(convertToDTO(restored));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // -----------------------
    // Helper methods to convert entities to DTOs
    // -----------------------
    private DocumentDTO convertToDTO(Document doc) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(doc.getId());
        dto.setTitle(doc.getTitle());
        dto.setContent(doc.getContent());
        dto.setProjectId(doc.getProject().getId());
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setUpdatedAt(doc.getUpdatedAt());
        return dto;
    }

    private DocumentVersionDTO convertVersionToDTO(DocumentVersion version) {
        DocumentVersionDTO dto = new DocumentVersionDTO();
        dto.setId(version.getId());
        dto.setVersionNumber(version.getVersionNumber());
        dto.setContent(version.getContent());
        dto.setChangeDescription(version.getChangeDescription());
        dto.setEditedBy(version.getEditedBy() != null ? version.getEditedBy().getEmail() : "System");
        dto.setCreatedAt(version.getCreatedAt());
        return dto;
    }
}
