package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.Notification;
import com.innovision.productivityhub.model.NotificationType;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.NotificationRepository;
import com.innovision.productivityhub.repository.UserRepository;
import java.util.List;
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
        User user = userRepository.findById(userId).orElseThrow();
        Notification notification = new Notification();
        notification.setRecipient(user);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    public List<Notification> unread(Long userId) {
        return notificationRepository.findByRecipientIdAndReadFlagFalse(userId);
    }

    public Notification markRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setReadFlag(true);
        return notificationRepository.save(notification);
    }
}
