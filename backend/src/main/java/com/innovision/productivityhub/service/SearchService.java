package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.Document;
import com.innovision.productivityhub.model.FileItem;
import com.innovision.productivityhub.model.Project;
import com.innovision.productivityhub.model.Task;
import com.innovision.productivityhub.repository.DocumentRepository;
import com.innovision.productivityhub.repository.FileItemRepository;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.repository.TaskRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class SearchService {
    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final FileItemRepository fileItemRepository;

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

    public Map<String, Object> search(String keyword) {
        Map<String, Object> results = new HashMap<>();
        String k = keyword.trim();
        List<Task> tasks = taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(k, k);
        List<Document> documents = documentRepository.findByTitleContainingIgnoreCase(keyword);
        List<Project> projects = projectRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(k, k);
        List<FileItem> files = fileItemRepository.findByNameContainingIgnoreCase(k);
        results.put("tasks", tasks);
        results.put("documents", documents);
        results.put("projects", projects);
        results.put("files", files);
        return results;
    }
}
