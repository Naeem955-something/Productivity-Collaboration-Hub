package com.innovision.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class WhiteboardSession {

    private Long projectId;
    private List<String> events; // JSON draw events
    private LocalDateTime lastUpdated;

    public WhiteboardSession(Long projectId) {
        this.projectId = projectId;
        this.events = new CopyOnWriteArrayList<>();
        this.lastUpdated = LocalDateTime.now();
    }

    public Long getProjectId() {
        return projectId;
    }

    public List<String> getEvents() {
        return events;
    }

    public void addEvent(String event) {
        this.events.add(event);
        this.lastUpdated = LocalDateTime.now();
    }

    public void clearBoard() {
        this.events.clear();
        this.lastUpdated = LocalDateTime.now();
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
}
