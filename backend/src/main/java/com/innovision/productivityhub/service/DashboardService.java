package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.ActivityLog;
import com.innovision.productivityhub.model.Notification;
import com.innovision.productivityhub.model.Task;
import com.innovision.productivityhub.model.TaskStatus;
import com.innovision.productivityhub.repository.ActivityLogRepository;
import com.innovision.productivityhub.repository.NotificationRepository;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.repository.TaskRepository;
import com.innovision.productivityhub.repository.TeamRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationRepository notificationRepository;
    private final TeamRepository teamRepository;

    public DashboardService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            ActivityLogRepository activityLogRepository,
            NotificationRepository notificationRepository,
            TeamRepository teamRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationRepository = notificationRepository;
        this.teamRepository = teamRepository;
    }

    public Map<String, Object> summary(Long userId) {
        Map<String, Object> payload = new HashMap<>();
        
        // Task statistics
        long totalTasks = taskRepository.count();
        long todoCount = taskRepository.countByStatus(TaskStatus.TODO);
        long inProgressCount = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long doneCount = taskRepository.countByStatus(TaskStatus.DONE);
        
        payload.put("totalTasks", totalTasks);
        payload.put("openTasks", inProgressCount);
        payload.put("completedTasks", doneCount);
        payload.put("tasksTodo", todoCount);
        payload.put("tasksInProgress", inProgressCount);
        payload.put("tasksDone", doneCount);
        
        // Calculate completion rate
        double completionRate = totalTasks > 0 ? (double) doneCount / totalTasks * 100 : 0;
        payload.put("completionRate", Math.round(completionRate));
        
        // Project statistics
        long activeProjects = projectRepository.count();
        payload.put("activeProjects", activeProjects);
        payload.put("totalProjects", activeProjects);
        
        // Team statistics
        long teamMembers = teamRepository.count() > 0 ? 10 : 0; // Placeholder for actual team member count
        payload.put("teamMembers", teamMembers);
        
        // Upcoming deadlines count
        List<Task> upcomingTasks = getUpcomingDeadlines(7); // 7 days
        payload.put("upcomingDeadlines", upcomingTasks.size());
        
        // Unread notifications count (user specific)
        long unreadNotifications = userId != null ? notificationRepository.countByRecipientIdAndReadFlagFalse(userId) : 0;
        payload.put("unreadNotifications", unreadNotifications);
        
        // Recent activity count
        payload.put("recentActivityCount", getRecentActivity(5).size());
        
        return payload;
    }

    public List<Task> getUpcomingDeadlines(int days) {
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(days);
        return taskRepository.findUpcomingTasks(today, deadline);
    }

    public List<Map<String, Object>> getRecentActivity(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<ActivityLog> activities = activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ActivityLog activity : activities) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", activity.getId());
            map.put("action", activity.getAction());
            map.put("details", activity.getDetails());
            map.put("severity", activity.getSeverity());
            map.put("actor", activity.getActor() != null ? activity.getActor().getName() : "System");
            map.put("createdAt", activity.getCreatedAt());
            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> getNotificationPreview(Long userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable).stream()
                .map(notification -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", notification.getId());
                    map.put("message", notification.getMessage());
                    map.put("type", notification.getType());
                    map.put("readFlag", notification.isReadFlag());
                    map.put("createdAt", notification.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
