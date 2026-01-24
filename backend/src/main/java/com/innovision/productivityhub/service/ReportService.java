package com.innovision.service;

// Import repositories to access database tables
import com.innovision.repository.ProjectRepository;
import com.innovision.repository.TaskRepository;
import com.innovision.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate; // To get current date for report
import java.util.HashMap;   // For storing report data
import java.util.Map;       // Interface for the report

// Mark this class as a Spring Service (business logic layer)
@Service
public class ReportService {

    // Repositories to interact with the database tables
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // Constructor injection: Spring injects the repositories
    public ReportService(ProjectRepository projectRepository,
                         TaskRepository taskRepository,
                         UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /**
     * Generate a **system-wide report** with overall stats
     */
    public Map<String, Object> generateSystemReport() {
        // Create a map to hold report data
        Map<String, Object> report = new HashMap<>();

        // Add current date
        report.put("date", LocalDate.now());

        // Add total number of users
        report.put("totalUsers", userRepository.count());

        // Add total number of projects
        report.put("totalProjects", projectRepository.count());

        // Add total number of tasks
        report.put("totalTasks", taskRepository.count());

        // Count tasks with status COMPLETED
        report.put("completedTasks", taskRepository.countByStatus("COMPLETED"));

        // Count tasks with status PENDING
        report.put("pendingTasks", taskRepository.countByStatus("PENDING"));

        // Return the report map
        return report;
    }

    /**
     * Generate a **project-specific report**
     * Includes project info, task counts, completed & pending tasks
     */
    public Map<String, Object> generateProjectReport(Long projectId) {
        Map<String, Object> report = new HashMap<>();

        // Fetch the project from DB; if not found, throw an error
        report.put("project", projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found")));

        // Count total tasks for this project
        report.put("totalTasks", taskRepository.countByProjectId(projectId));

        // Count completed tasks for this project
        report.put("completedTasks", taskRepository.countByProjectIdAndStatus(projectId, "COMPLETED"));

        // Count pending tasks for this project
        report.put("pendingTasks", taskRepository.countByProjectIdAndStatus(projectId, "PENDING"));

        // Return the project report map
        return report;
    }
}
