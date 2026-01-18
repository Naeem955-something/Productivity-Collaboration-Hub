package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.service.DashboardService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(@RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(dashboardService.summary(userId));
    }

    @GetMapping("/upcoming-deadlines")
    public ResponseEntity<?> upcomingDeadlines(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(dashboardService.getUpcomingDeadlines(days));
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<?> recentActivity(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(dashboardService.getRecentActivity(limit));
    }

    @GetMapping("/notifications-preview/{userId}")
    public ResponseEntity<?> notificationsPreview(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(dashboardService.getNotificationPreview(userId, limit));
    }
}
