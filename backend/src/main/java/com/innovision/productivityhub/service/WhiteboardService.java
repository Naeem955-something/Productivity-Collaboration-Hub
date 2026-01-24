package com.innovision.service;

import com.innovision.model.WhiteboardSession;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WhiteboardService manages the whiteboard sessions for each project.
 * 
 * It stores events in memory and allows adding, fetching, and clearing whiteboard actions.
 * This is the core backend service used by WhiteboardWebSocket to persist and share
 * real-time whiteboard updates between users.
 */
@Service
public class WhiteboardService {

    // ✅ In-memory storage for all active whiteboard sessions
    // Key = projectId, Value = WhiteboardSession object
    private final Map<Long, WhiteboardSession> sessions = new ConcurrentHashMap<>();

    /**
     * ✅ Get the whiteboard session for a project.
     * If the session does not exist, create a new one.
     *
     * @param projectId - ID of the project
     * @return WhiteboardSession for the project
     */
    public WhiteboardSession getSession(Long projectId) {
        // computeIfAbsent: fetch existing or create new WhiteboardSession
        return sessions.computeIfAbsent(projectId, WhiteboardSession::new);
    }

    /**
     * ✅ Add a new event (like drawing or text) to the whiteboard session.
     *
     * @param projectId - ID of the project
     * @param eventJson - JSON string representing the whiteboard action
     */
    public void addEvent(Long projectId, String eventJson) {
        // Get the session
        WhiteboardSession session = getSession(projectId);
        // Add event to the session
        session.addEvent(eventJson);
    }

    /**
     * ✅ Clear all whiteboard actions for a project.
     *
     * @param projectId - ID of the project
     */
    public void clearBoard(Long projectId) {
        // Get the session
        WhiteboardSession session = getSession(projectId);
        // Clear all events in this session
        session.clearBoard();
    }

    /**
     * ✅ Get all active whiteboard sessions
     * Useful for debugging or admin purposes
     *
     * @return Map of projectId -> WhiteboardSession
     */
    public Map<Long, WhiteboardSession> getAllSessions() {
        return sessions;
    }
}
