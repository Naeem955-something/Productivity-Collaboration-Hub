package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.model.Notification;
import com.innovision.productivityhub.service.NotificationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

    @PostMapping("/read/{id}")
    public ResponseEntity<Notification> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    @PostMapping("/send/{userId}")
    public ResponseEntity<Notification> send(@PathVariable Long userId, @RequestBody String message) {
        return ResponseEntity.ok(notificationService.notifyUser(userId, message, com.innovision.productivityhub.model.NotificationType.SYSTEM));
    }
}
