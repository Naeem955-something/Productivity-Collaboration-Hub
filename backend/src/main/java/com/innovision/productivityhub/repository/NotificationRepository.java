package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdAndReadFlagFalse(Long userId);
}
