package com.innovision.productivityhub.service;

import com.innovision.productivityhub.dto.ProjectRequest;
import com.innovision.productivityhub.model.Project;
import com.innovision.productivityhub.model.Team;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.repository.TeamRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;

    public ProjectService(ProjectRepository projectRepository, TeamRepository teamRepository) {
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public List<Project> findByTeam(Long teamId) {
        return teamId == null ? projectRepository.findAll() : projectRepository.findByTeamId(teamId);
    }

    public Project findById(Long id) {
        return projectRepository.findById(id).orElseThrow();
    }

    @Transactional
    public Project create(ProjectRequest request) {
        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        project.setStatus(request.status());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        if (request.teamId() != null) {
            Team team = teamRepository.findById(request.teamId()).orElseThrow();
            project.setTeam(team);
        }
        return projectRepository.save(project);
    }

    @Transactional
    public Project update(Long id, ProjectRequest request) {
        Project project = findById(id);
        project.setName(request.name());
        project.setDescription(request.description());
        project.setStatus(request.status());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        return projectRepository.save(project);
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }
}
