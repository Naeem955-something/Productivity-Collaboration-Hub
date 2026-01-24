package com.innovision.service;

import com.innovision.repository.ProjectRepository;
import com.innovision.repository.TaskRepository;
import com.innovision.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public ReportService(ProjectRepository projectRepository,
                         TaskRepository taskRepository,
                         UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /**
     * Overall system report
     */
    public Map<String, Object> generateSystemReport() {
        Map<String, Object> report = new HashMap<>();

        report.put("date", LocalDate.now());
        report.put("totalUsers", userRepository.count());
        report.put("totalProjects", projectRepository.count());
        report.put("totalTasks", taskRepository.count());
        report.put("completedTasks", taskRepository.countByStatus("COMPLETED"));
        report.put("pendingTasks", taskRepository.countByStatus("PENDING"));

        return report;
    }

    /**
     * Project-specific report
     */
    public Map<String, Object> generateProjectReport(Long projectId) {
        Map<String, Object> report = new HashMap<>();

        report.put("project", projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found")));

        report.put("totalTasks",
                taskRepository.countByProjectId(projectId));

        report.put("completedTasks",
                taskRepository.countByProjectIdAndStatus(projectId, "COMPLETED"));

        report.put("pendingTasks",
                taskRepository.countByProjectIdAndStatus(projectId, "PENDING"));

        return report;
    }
}
