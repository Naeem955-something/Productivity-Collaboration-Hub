package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.model.Document;
import com.innovision.productivityhub.service.DocumentService;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
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

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Document>> byProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(documentService.byProject(projectId));
    }

    @PostMapping("/project/{projectId}")
    public ResponseEntity<Document> create(@PathVariable Long projectId,
                                           @RequestBody String content,
                                           Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(documentService.create(projectId, "Untitled Doc", content, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> update(@PathVariable Long id,
                                           @RequestBody String content,
                                           Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(documentService.update(id, content, email));
    }
}
