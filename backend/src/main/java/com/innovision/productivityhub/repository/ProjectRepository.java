package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByTeamId(Long teamId);
}
