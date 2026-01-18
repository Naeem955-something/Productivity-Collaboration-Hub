package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.ActivityLog;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long deleteByCreatedAtBefore(java.time.Instant cutoff);
}
