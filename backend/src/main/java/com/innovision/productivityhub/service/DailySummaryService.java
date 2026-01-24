package com.innovision.service;

// Importing model and repositories used by this service
import com.innovision.model.DailySummary;
import com.innovision.repository.ActivityLogRepository;
import com.innovision.repository.DailySummaryRepository;
import com.innovision.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * DailySummaryService
 *
 * Responsible for:
 * 1. Generating the daily summary (tasks completed, pending, recent activity)
 * 2. Storing the summary into the database
 * 3. Fetching historical summaries
 */
@Service // Marks this class as a Spring service bean
public class DailySummaryService {

    // Repositories used to fetch tasks, activity logs, and store summaries
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final DailySummaryRepository dailySummaryRepository;

    // Constructor-based dependency injection
    public DailySummaryService(TaskRepository taskRepository,
                               ActivityLogRepository activityLogRepository,
                               DailySummaryRepository dailySummaryRepository) {
        this.taskRepository = taskRepository;
        this.activityLogRepository = activityLogRepository;
        this.dailySummaryRepository = dailySummaryRepository;
    }

    /**
     * Generate and store today's daily summary
     *
     * Steps:
     * 1️⃣ Count all completed tasks today
     * 2️⃣ Count pending tasks (not completed)
     * 3️⃣ Fetch today's recent activity logs
     * 4️⃣ Create a DailySummary object
     * 5️⃣ Save it in the database
     */
    public DailySummary generateDailySummary() {

        // Count tasks that have status COMPLETED for today
        int completedTasks =
                taskRepository.countByStatusAndDate("COMPLETED", LocalDate.now());

        // Count tasks that are NOT completed (pending)
        int pendingTasks =
                taskRepository.countByStatusNot("COMPLETED");

        // Fetch list of recent activities for today (could be task updates, comments, etc.)
        List<String> recentActivities =
                activityLogRepository.findRecentActivities(LocalDate.now());

        // Create DailySummary object and set its fields
        DailySummary summary = new DailySummary();
        summary.setDate(LocalDate.now());
        summary.setCompletedTasks(completedTasks);
        summary.setPendingTasks(pendingTasks);
        summary.setRecentActivities(recentActivities.toString());

        // Save the summary in DB and return it
        return dailySummaryRepository.save(summary);
    }

    /**
     * Fetch all previously generated summaries
     *
     * Returns:
     * List of DailySummary objects ordered by date (most recent first)
     */
    public List<DailySummary> getSummaryHistory() {
        return dailySummaryRepository.findAllByOrderByDateDesc();
    }
}
