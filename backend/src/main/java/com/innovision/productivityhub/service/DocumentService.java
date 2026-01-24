package com.innovision.productivityhub.service;

// Import model classes: Document, Project, User
import com.innovision.productivityhub.model.Document;
import com.innovision.productivityhub.model.Project;
import com.innovision.productivityhub.model.User;

// Import repository interfaces for database operations
import com.innovision.productivityhub.repository.DocumentRepository;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.repository.UserRepository;

import java.util.List;

import org.springframework.stereotype.Service;

@Service  // Marks this class as a Spring Service (business logic layer)
public class DocumentService {

    // Repositories for CRUD operations
    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    // Constructor injection of dependencies (Spring automatically injects these)
    public DocumentService(DocumentRepository documentRepository,
                           ProjectRepository projectRepository,
                           UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all documents for a specific project
     * @param projectId - the ID of the project
     * @return List<Document> - all documents under this project
     * Used by frontend to display all project documents
     */
    public List<Document> byProject(Long projectId) {
        return documentRepository.findByProjectId(projectId);
    }

    /**
     * Create a new document
     * @param projectId - the project this document belongs to
     * @param title - document title
     * @param content - initial content
     * @param editorEmail - the user creating the document
     * @return Document - saved document entity
     *
     * Steps:
     * 1. Find project by ID
     * 2. Find editor by email (if provided)
     * 3. Create Document entity and set fields
     * 4. Save document to DB using DocumentRepository
     */
    public Document create(Long projectId, String title, String content, String editorEmail) {
        Project project = projectRepository.findById(projectId).orElseThrow(); // Get project, fail if not exists
        User editor = editorEmail != null ? userRepository.findByEmail(editorEmail).orElse(null) : null; // Get editor user

        Document document = new Document();
        document.setProject(project);  // Link document to project
        document.setTitle(title);      // Set title
        document.setContent(content);  // Set content
        document.setLastEditedBy(editor); // Track who created/edited
        return documentRepository.save(document); // Persist to DB and return saved entity
    }

    /**
     * Update an existing document
     * @param id - document ID
     * @param content - updated content
     * @param editorEmail - user updating the document
     * @return Document - updated document entity
     *
     * Steps:
     * 1. Find existing document by ID
     * 2. Update content and increment version
     * 3. Update last editor
     * 4. Save changes to DB
     */
    public Document update(Long id, String content, String editorEmail) {
        Document document = documentRepository.findById(id).orElseThrow(); // Find existing document
        document.setContent(content);                  // Update content
        document.setVersion(document.getVersion() + 1); // Increment version for version tracking
        User editor = editorEmail != null ? userRepository.findByEmail(editorEmail).orElse(null) : null; // Find editor
        document.setLastEditedBy(editor);             // Update last editor
        return documentRepository.save(document);     // Persist updates and return updated document
    }
}
