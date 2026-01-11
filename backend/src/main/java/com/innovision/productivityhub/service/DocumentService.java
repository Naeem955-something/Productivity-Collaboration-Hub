package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.Document;
import com.innovision.productivityhub.model.Project;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.DocumentRepository;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public DocumentService(DocumentRepository documentRepository,
                           ProjectRepository projectRepository,
                           UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<Document> byProject(Long projectId) {
        return documentRepository.findByProjectId(projectId);
    }

    public Document create(Long projectId, String title, String content, String editorEmail) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        User editor = editorEmail != null ? userRepository.findByEmail(editorEmail).orElse(null) : null;

        Document document = new Document();
        document.setProject(project);
        document.setTitle(title);
        document.setContent(content);
        document.setLastEditedBy(editor);
        return documentRepository.save(document);
    }

    public Document update(Long id, String content, String editorEmail) {
        Document document = documentRepository.findById(id).orElseThrow();
        document.setContent(content);
        document.setVersion(document.getVersion() + 1);
        User editor = editorEmail != null ? userRepository.findByEmail(editorEmail).orElse(null) : null;
        document.setLastEditedBy(editor);
        return documentRepository.save(document);
    }
}
