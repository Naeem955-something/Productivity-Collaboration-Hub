package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.Goal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByOwnerId(Long ownerId);
    List<Goal> findByTeamId(Long teamId);
}
