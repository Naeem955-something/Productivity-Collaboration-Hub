package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.Task;
import com.innovision.productivityhub.model.TaskStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    long countByStatus(TaskStatus status);
    List<Task> findByTitleContainingIgnoreCase(String keyword);
}
