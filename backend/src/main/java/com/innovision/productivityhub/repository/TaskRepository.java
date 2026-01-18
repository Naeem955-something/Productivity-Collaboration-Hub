package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.Task;
import com.innovision.productivityhub.model.TaskStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    long countByStatus(TaskStatus status);
    List<Task> findByTitleContainingIgnoreCase(String keyword);
    
    @Query("SELECT t FROM Task t WHERE t.dueDate IS NOT NULL AND t.dueDate BETWEEN :startDate AND :endDate ORDER BY t.dueDate ASC")
    List<Task> findUpcomingTasks(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
