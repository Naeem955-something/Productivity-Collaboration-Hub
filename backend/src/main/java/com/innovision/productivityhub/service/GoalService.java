package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.Goal;
import com.innovision.productivityhub.model.GoalStatus;
import com.innovision.productivityhub.model.Team;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.GoalRepository;
import com.innovision.productivityhub.repository.TeamRepository;
import com.innovision.productivityhub.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class GoalService {
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository, TeamRepository teamRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
    }

    public List<Goal> forUser(Long userId) {
        return goalRepository.findByOwnerId(userId);
    }

    public List<Goal> forTeam(Long teamId) {
        return goalRepository.findByTeamId(teamId);
    }

    public Goal create(Long ownerId, Long teamId, String title, String description, int target) {
        User owner = userRepository.findById(ownerId).orElseThrow();
        Team team = teamId != null ? teamRepository.findById(teamId).orElse(null) : null;
        Goal goal = new Goal();
        goal.setOwner(owner);
        goal.setTeam(team);
        goal.setTitle(title);
        goal.setDescription(description);
        goal.setTargetValue(target);
        goal.setStatus(GoalStatus.IN_PROGRESS);
        return goalRepository.save(goal);
    }

    public Goal updateProgress(Long id, int currentValue) {
        Goal goal = goalRepository.findById(id).orElseThrow();
        goal.setCurrentValue(currentValue);
        if (currentValue >= goal.getTargetValue()) {
            goal.setStatus(GoalStatus.COMPLETED);
        }
        return goalRepository.save(goal);
    }
}
