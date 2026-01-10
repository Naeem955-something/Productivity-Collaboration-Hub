package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.dto.TaskUpdateRequest;
import com.innovision.productivityhub.model.Task;
import com.innovision.productivityhub.service.TaskService;
import java.util.List;
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
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> byProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.findByProject(projectId));
    }

    @PostMapping("/project/{projectId}")
    public ResponseEntity<Task> create(@PathVariable Long projectId, @RequestBody TaskUpdateRequest request) {
        return ResponseEntity.ok(taskService.create(projectId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable Long id, @RequestBody TaskUpdateRequest request) {
        return ResponseEntity.ok(taskService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
