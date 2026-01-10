package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.TaskStatus;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.repository.TaskRepository;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public DashboardService(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public Map<String, Object> summary() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("projects", projectRepository.count());
        payload.put("tasksTotal", taskRepository.count());
        payload.put("tasksTodo", taskRepository.countByStatus(TaskStatus.TODO));
        payload.put("tasksInProgress", taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
        payload.put("tasksDone", taskRepository.countByStatus(TaskStatus.DONE));
        return payload;
    }
}
