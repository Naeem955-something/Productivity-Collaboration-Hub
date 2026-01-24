// Package where the service resides
package com.innovision.productivityhub.service;

// Importing required model classes (Entities)
import com.innovision.productivityhub.model.Document;
import com.innovision.productivityhub.model.FileItem;
import com.innovision.productivityhub.model.Project;
import com.innovision.productivityhub.model.Task;

// Importing repositories (used to interact with database)
import com.innovision.productivityhub.repository.DocumentRepository;
import com.innovision.productivityhub.repository.FileItemRepository;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.repository.TaskRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

// Annotation to mark this as a Spring Service component
@Service
public class SearchService {

    // Injecting repositories to access database for each entity
    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final FileItemRepository fileItemRepository;

    // Constructor injection for repositories
    public SearchService(
            TaskRepository taskRepository,
            DocumentRepository documentRepository,
            ProjectRepository projectRepository,
            FileItemRepository fileItemRepository) {
        this.taskRepository = taskRepository;
        this.documentRepository = documentRepository;
        this.projectRepository = projectRepository;
        this.fileItemRepository = fileItemRepository;
    }

    // Main search method which accepts a keyword string
    public Map<String, Object> search(String keyword) {

        // Create a map to hold results for each entity type
        Map<String, Object> results = new HashMap<>();

        // Trim the keyword to remove unnecessary spaces
        String k = keyword.trim();

        // Search Tasks where title or description contains the keyword (case-insensitive)
        List<Task> tasks = taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(k, k);

        // Search Documents where title contains the keyword
        List<Document> documents = documentRepository.findByTitleContainingIgnoreCase(keyword);

        // Search Projects where name or description contains the keyword
        List<Project> projects = projectRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(k, k);

        // Search Files where file name contains the keyword
        List<FileItem> files = fileItemRepository.findByNameContainingIgnoreCase(k);

        // Add all search results to the results map
        results.put("tasks", tasks);
        results.put("documents", documents);
        results.put("projects", projects);
        results.put("files", files);

        // Return the map containing results for frontend
        return results;
    }
}
