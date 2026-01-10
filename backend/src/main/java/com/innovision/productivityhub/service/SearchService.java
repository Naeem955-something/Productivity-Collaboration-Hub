package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.Document;
import com.innovision.productivityhub.model.Task;
import com.innovision.productivityhub.repository.DocumentRepository;
import com.innovision.productivityhub.repository.TaskRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class SearchService {
    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;

    public SearchService(TaskRepository taskRepository, DocumentRepository documentRepository) {
        this.taskRepository = taskRepository;
        this.documentRepository = documentRepository;
    }

    public Map<String, Object> search(String keyword) {
        Map<String, Object> results = new HashMap<>();
        List<Task> tasks = taskRepository.findByTitleContainingIgnoreCase(keyword);
        List<Document> documents = documentRepository.findByTitleContainingIgnoreCase(keyword);
        results.put("tasks", tasks);
        results.put("documents", documents);
        return results;
    }
}
