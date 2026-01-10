package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.model.Team;
import com.innovision.productivityhub.repository.TeamRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teams")
public class TeamController {
    private final TeamRepository teamRepository;

    public TeamController(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @GetMapping
    public ResponseEntity<List<Team>> list() {
        return ResponseEntity.ok(teamRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Team> create(@RequestBody Team team) {
        return ResponseEntity.ok(teamRepository.save(team));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> get(@PathVariable Long id) {
        return ResponseEntity.of(teamRepository.findById(id));
    }
}
