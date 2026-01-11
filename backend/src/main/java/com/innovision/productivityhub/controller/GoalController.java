package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.model.Goal;
import com.innovision.productivityhub.service.GoalService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> userGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(goalService.forUser(userId));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<Goal>> teamGoals(@PathVariable Long teamId) {
        return ResponseEntity.ok(goalService.forTeam(teamId));
    }

    @PostMapping
    public ResponseEntity<Goal> create(@RequestParam Long ownerId,
                                       @RequestParam(required = false) Long teamId,
                                       @RequestParam String title,
                                       @RequestBody String description,
                                       @RequestParam(defaultValue = "100") int target) {
        return ResponseEntity.ok(goalService.create(ownerId, teamId, title, description, target));
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<Goal> updateProgress(@PathVariable Long id, @RequestParam int current) {
        return ResponseEntity.ok(goalService.updateProgress(id, current));
    }
}
