package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdAndReadFlagFalse(Long userId);
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);

    long countByRecipientIdAndReadFlagFalse(Long userId);

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);

    long deleteByReadFlagTrueAndCreatedAtBefore(java.time.Instant cutoff);
}
