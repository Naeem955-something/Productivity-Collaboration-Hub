package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.Notification;
import com.innovision.productivityhub.model.NotificationType;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.NotificationRepository;
import com.innovision.productivityhub.repository.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification notifyUser(Long userId, String message, NotificationType type) {
        return notifyUser(userId, message, type, null);
    }

    public Notification notifyUser(Long userId, String message, NotificationType type, String link) {
        User user = userRepository.findById(userId).orElseThrow();
        Notification notification = new Notification();
        notification.setRecipient(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLink(link);
        return notificationRepository.save(notification);
    }

    public List<Notification> unread(Long userId) {
        return notificationRepository.findByRecipientIdAndReadFlagFalse(userId);
    }

    public List<Notification> getByUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getRecent(Long userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFlagFalse(userId);
    }

    public Notification markRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setReadFlag(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.findByRecipientIdAndReadFlagFalse(userId).forEach(notification -> {
            notification.setReadFlag(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public long cleanupOldNotifications(Duration retention) {
        Instant cutoff = Instant.now().minus(retention);
        return notificationRepository.deleteByReadFlagTrueAndCreatedAtBefore(cutoff);
    }
}
