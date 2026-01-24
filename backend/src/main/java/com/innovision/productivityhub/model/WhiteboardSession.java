package com.innovision.model;

import java.time.LocalDateTime; // To track when the session was last updated
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList; // Thread-safe list for concurrent access

/**
 * WhiteboardSession
 * Represents a single collaborative whiteboard session for a project.
 */
public class WhiteboardSession {

    private Long projectId; // ID of the project this whiteboard belongs to

    private List<String> events; // Stores drawing events in JSON format (lines, shapes, text)

    private LocalDateTime lastUpdated; // Timestamp of the last change on the board

    /**
     * Constructor initializes a session for a project
     * @param projectId Project ID for this whiteboard session
     */
    public WhiteboardSession(Long projectId) {
        this.projectId = projectId; 
        // CopyOnWriteArrayList allows safe concurrent modifications from multiple threads
        this.events = new CopyOnWriteArrayList<>(); 
        this.lastUpdated = LocalDateTime.now(); // set initial timestamp
    }

    // Getter for project ID
    public Long getProjectId() {
        return projectId;
    }

    // Getter for events list
    public List<String> getEvents() {
        return events;
    }

    /**
     * Add a new drawing event to the whiteboard
     * @param event JSON string representing the drawing action (line, text, shape)
     */
    public void addEvent(String event) {
        this.events.add(event); // Add event to the list
        this.lastUpdated = LocalDateTime.now(); // Update timestamp
    }

    /**
     * Clear all events on the whiteboard
     */
    public void clearBoard() {
        this.events.clear(); // Remove all drawing events
        this.lastUpdated = LocalDateTime.now(); // Update timestamp
    }

    // Getter for last updated timestamp
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
}
