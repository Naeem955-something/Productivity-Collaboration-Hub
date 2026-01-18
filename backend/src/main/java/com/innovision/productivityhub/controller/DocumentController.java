package com.innovision.productivityhub.controller;

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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final ProjectRepository projectRepository;

    public DocumentController(DocumentService documentService,
                            DocumentRepository documentRepository,
                            DocumentVersionRepository documentVersionRepository,
                            ProjectRepository projectRepository) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
        this.documentVersionRepository = documentVersionRepository;
        this.projectRepository = projectRepository;
    }

    // Get all documents for a project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Document>> byProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(documentService.byProject(projectId));
    }

    // Create a new document
    @PostMapping("/project/{projectId}")
    public ResponseEntity<Document> create(@PathVariable Long projectId,
                                           @RequestBody String content,
                                           Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(documentService.create(projectId, "Untitled Doc", content, email));
    }

    // Create document from DTO
    @PostMapping
    public ResponseEntity<DocumentDTO> createDocument(@RequestBody DocumentDTO dto) {
        try {
            var project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            Document doc = new Document();
            doc.setTitle(dto.getTitle());
            doc.setContent(dto.getContent() != null ? dto.getContent() : "");
            doc.setProject(project);

            Document saved = documentRepository.save(doc);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Update a document
    @PutMapping("/{id}")
    public ResponseEntity<Document> update(@PathVariable Long id,
                                           @RequestBody String content,
                                           Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(documentService.update(id, content, email));
    }

    // Update document and create version
    @PutMapping("/{docId}")
    public ResponseEntity<DocumentDTO> updateDocument(
            @PathVariable Long docId,
            @RequestBody DocumentDTO dto) {
        try {
            Document doc = documentRepository.findById(docId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Save current version before updating
            if (!doc.getContent().isEmpty()) {
                DocumentVersion version = new DocumentVersion();
                version.setDocument(doc);
                version.setContent(doc.getContent());
                List<DocumentVersion> existing = documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(docId);
                version.setVersionNumber(existing.isEmpty() ? 1 : existing.get(0).getVersionNumber() + 1);
                version.setChangeDescription(dto.getChangeDescription() != null ? 
                        dto.getChangeDescription() : "Updated");
                documentVersionRepository.save(version);
            }

            // Update document
            doc.setTitle(dto.getTitle());
            doc.setContent(dto.getContent());
            Document updated = documentRepository.save(doc);

            return ResponseEntity.ok(convertToDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Delete a document
    @DeleteMapping("/{docId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long docId) {
        try {
            Document doc = documentRepository.findById(docId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Delete all versions first
            documentVersionRepository.deleteAll(
                    documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(docId)
            );

            // Delete document
            documentRepository.delete(doc);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Get version history for a document
    @GetMapping("/{docId}/versions")
    public ResponseEntity<List<DocumentVersionDTO>> getDocumentVersions(@PathVariable Long docId) {
        try {
            List<DocumentVersion> versions = documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(docId);
            if (versions == null || versions.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            List<DocumentVersionDTO> dtos = versions.stream()
                    .map(this::convertVersionToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Restore a document to a previous version
    @PostMapping("/{docId}/restore/{versionNumber}")
    public ResponseEntity<DocumentDTO> restoreVersion(
            @PathVariable Long docId,
            @PathVariable Integer versionNumber) {
        try {
            Document doc = documentRepository.findById(docId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            List<DocumentVersion> versions = documentVersionRepository.findByDocumentIdOrderByVersionNumberDesc(docId);
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

            // Restore to previous version
            doc.setContent(targetVersion.getContent());
            Document restored = documentRepository.save(doc);

            return ResponseEntity.ok(convertToDTO(restored));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Helper methods
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
