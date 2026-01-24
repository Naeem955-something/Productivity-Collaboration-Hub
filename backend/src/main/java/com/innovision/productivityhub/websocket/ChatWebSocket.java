package com.innovision.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovision.model.Message;
import com.innovision.service.ChatService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocket extends TextWebSocketHandler {

    private final ChatService chatService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // projectId → active sessions
    private final Map<Long, Set<WebSocketSession>> projectSessions =
            new ConcurrentHashMap<>();

    public ChatWebSocket(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * When a user connects to chat
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long projectId = getProjectId(session);
        projectSessions
                .computeIfAbsent(projectId, k -> ConcurrentHashMap.newKeySet())
                .add(session);

        System.out.println("🟢 User connected to project chat: " + projectId);
    }

    /**
     * When a message is sent
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message)
            throws Exception {

        // Convert JSON → Message object
        Message chatMessage =
                objectMapper.readValue(message.getPayload(), Message.class);

        // Save message to database
        Message savedMessage = chatService.saveMessage(chatMessage);

        // Broadcast message to all users in the same project
        broadcastMessage(savedMessage);
    }

    /**
     * When a user disconnects
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long projectId = getProjectId(session);
        Set<WebSocketSession> sessions = projectSessions.get(projectId);

        if (sessions != null) {
            sessions.remove(session);
        }

        System.out.println("🔴 User disconnected from project chat: " + projectId);
    }

    /**
     * Send message to all connected users in project
     */
    private void broadcastMessage(Message message) throws Exception {
        Long projectId = message.getProjectId();
        Set<WebSocketSession> sessions = projectSessions.get(projectId);

        if (sessions == null) return;

        String json = objectMapper.writeValueAsString(message);

        for (WebSocketSession ws : sessions) {
            if (ws.isOpen()) {
                ws.sendMessage(new TextMessage(json));
            }
        }
    }

    /**
     * Extract projectId from WebSocket URL
     * Example: /ws/chat?projectId=5
     */
    private Long getProjectId(WebSocketSession session) {
        String query = session.getUri().getQuery();
        for (String param : query.split("&")) {
            if (param.startsWith("projectId=")) {
                return Long.parseLong(param.split("=")[1]);
            }
        }
        throw new RuntimeException("Project ID missing in WebSocket URL");
    }
}
