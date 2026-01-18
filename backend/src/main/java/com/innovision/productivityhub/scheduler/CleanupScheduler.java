package com.innovision.productivityhub.scheduler;

import com.innovision.productivityhub.repository.ActivityLogRepository;
import com.innovision.productivityhub.service.NotificationService;
import java.time.Duration;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CleanupScheduler {
    private static final Logger log = LoggerFactory.getLogger(CleanupScheduler.class);

    private final NotificationService notificationService;
    private final ActivityLogRepository activityLogRepository;

    public CleanupScheduler(NotificationService notificationService, ActivityLogRepository activityLogRepository) {
        this.notificationService = notificationService;
        this.activityLogRepository = activityLogRepository;
    }

    // Runs daily at 2:30 AM server time
    @Scheduled(cron = "0 30 2 * * *")
    public void cleanupInactiveData() {
        long notificationsRemoved = notificationService.cleanupOldNotifications(Duration.ofDays(90));
        long activitiesRemoved = activityLogRepository.deleteByCreatedAtBefore(Instant.now().minus(Duration.ofDays(180)));
        log.info("Cleanup job removed {} notifications and {} activity logs", notificationsRemoved, activitiesRemoved);
    }
}
