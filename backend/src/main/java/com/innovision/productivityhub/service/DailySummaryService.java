package com.innovision.service;

import com.innovision.model.DailySummary;
import com.innovision.repository.ActivityLogRepository;
import com.innovision.repository.DailySummaryRepository;
import com.innovision.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DailySummaryService {

    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final DailySummaryRepository dailySummaryRepository;

    public DailySummaryService(TaskRepository taskRepository,
                               ActivityLogRepository activityLogRepository,
                               DailySummaryRepository dailySummaryRepository) {
        this.taskRepository = taskRepository;
        this.activityLogRepository = activityLogRepository;
        this.dailySummaryRepository = dailySummaryRepository;
    }

    /**
     * Generate and store daily summary
     */
    public DailySummary generateDailySummary() {

        int completedTasks =
                taskRepository.countByStatusAndDate("COMPLETED", LocalDate.now());

        int pendingTasks =
                taskRepository.countByStatusNot("COMPLETED");

        List<String> recentActivities =
                activityLogRepository.findRecentActivities(LocalDate.now());

        DailySummary summary = new DailySummary();
        summary.setDate(LocalDate.now());
        summary.setCompletedTasks(completedTasks);
        summary.setPendingTasks(pendingTasks);
        summary.setRecentActivities(recentActivities.toString());

        return dailySummaryRepository.save(summary);
    }

    /**
     * Fetch previous summaries
     */
    public List<DailySummary> getSummaryHistory() {
        return dailySummaryRepository.findAllByOrderByDateDesc();
    }
}
