package com.innovision.service;

import com.innovision.model.WhiteboardSession;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WhiteboardService {

    // projectId -> WhiteboardSession
    private final Map<Long, WhiteboardSession> sessions = new ConcurrentHashMap<>();

    public WhiteboardSession getSession(Long projectId) {
        return sessions.computeIfAbsent(projectId, WhiteboardSession::new);
    }

    public void addEvent(Long projectId, String eventJson) {
        WhiteboardSession session = getSession(projectId);
        session.addEvent(eventJson);
    }

    public void clearBoard(Long projectId) {
        WhiteboardSession session = getSession(projectId);
        session.clearBoard();
    }

    public Map<Long, WhiteboardSession> getAllSessions() {
        return sessions;
    }
}
