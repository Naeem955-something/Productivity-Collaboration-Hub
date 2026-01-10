package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> { }
