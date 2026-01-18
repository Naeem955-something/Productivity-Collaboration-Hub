package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.dto.NotificationRequest;
import com.innovision.productivityhub.model.Notification;
import com.innovision.productivityhub.model.NotificationType;
import com.innovision.productivityhub.service.NotificationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<Notification>> unread(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.unread(userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getByUser(userId));
    }

    @GetMapping("/recent/{userId}")
    public ResponseEntity<List<Notification>> recent(@PathVariable Long userId,
                                                     @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(notificationService.getRecent(userId, limit));
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> unreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.unreadCount(userId));
    }

    @PostMapping("/read/{id}")
    public ResponseEntity<Notification> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    @PostMapping("/mark-all-read/{userId}")
    public ResponseEntity<Void> markAllRead(@PathVariable Long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/send")
    public ResponseEntity<Notification> send(@RequestBody NotificationRequest request) {
        NotificationType type = request.type() != null ? request.type() : NotificationType.SYSTEM;
        return ResponseEntity.ok(notificationService.notifyUser(request.recipientId(), request.message(), type, request.link()));
    }
}
