package com.innovision.websocket; // Package for all WebSocket related classes

import com.fasterxml.jackson.databind.ObjectMapper; // For converting JSON ↔ Java objects
import com.innovision.model.Message; // Message entity (DB + frontend structure)
import com.innovision.service.ChatService; // Service to handle chat DB operations
import org.springframework.stereotype.Component; // Marks this class as a Spring Bean
import org.springframework.web.socket.*; // WebSocket classes
import org.springframework.web.socket.handler.TextWebSocketHandler; // Base class for text messages

import java.util.*; 
import java.util.concurrent.ConcurrentHashMap; // Thread-safe Map for sessions

@Component // Spring will detect this and register it as a WebSocket handler
public class ChatWebSocket extends TextWebSocketHandler {

    private final ChatService chatService; // Service to save and fetch messages
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON ↔ Java conversion

    // Map to store active WebSocket sessions per project
    // Key: projectId, Value: Set of connected WebSocket sessions
    private final Map<Long, Set<WebSocketSession>> projectSessions =
            new ConcurrentHashMap<>();

    // Constructor injection for chatService
    public ChatWebSocket(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Called automatically when a client connects to WebSocket
     * Adds the user's session to the corresponding project set
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long projectId = getProjectId(session); // Extract projectId from URL
        projectSessions
                .computeIfAbsent(projectId, k -> ConcurrentHashMap.newKeySet()) // Create set if missing
                .add(session); // Add current user's session

        System.out.println("🟢 User connected to project chat: " + projectId); // Debug log
    }

    /**
     * Called automatically when a text message is received from a client
     * - Converts JSON message to Java Message object
     * - Saves it to the database
     * - Broadcasts to all users connected to the same project
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message)
            throws Exception {

        // Convert incoming JSON message to Message object
        Message chatMessage =
                objectMapper.readValue(message.getPayload(), Message.class);

        // Persist message in DB using ChatService
        Message savedMessage = chatService.saveMessage(chatMessage);

        // Broadcast the message to all users in the same project
        broadcastMessage(savedMessage);
    }

    /**
     * Called automatically when a client disconnects
     * Removes session from the project map
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long projectId = getProjectId(session); // Get projectId of disconnected session
        Set<WebSocketSession> sessions = projectSessions.get(projectId);

        if (sessions != null) {
            sessions.remove(session); // Remove the session
        }

        System.out.println("🔴 User disconnected from project chat: " + projectId); // Debug log
    }

    /**
     * Broadcast message to all connected users in the project
     */
    private void broadcastMessage(Message message) throws Exception {
        Long projectId = message.getProjectId(); // Identify project
        Set<WebSocketSession> sessions = projectSessions.get(projectId);

        if (sessions == null) return; // No users to broadcast

        String json = objectMapper.writeValueAsString(message); // Convert message to JSON

        // Send message to each connected session
        for (WebSocketSession ws : sessions) {
            if (ws.isOpen()) { // Only send if session is open
                ws.sendMessage(new TextMessage(json));
            }
        }
    }

    /**
     * Extract projectId from WebSocket URL
     * Example: ws://localhost:8080/ws/chat?projectId=5
     */
    private Long getProjectId(WebSocketSession session) {
        String query = session.getUri().getQuery(); // Get query params
        for (String param : query.split("&")) { // Split multiple params
            if (param.startsWith("projectId=")) {
                return Long.parseLong(param.split("=")[1]); // Parse projectId
            }
        }
        // If no projectId in URL, throw exception
        throw new RuntimeException("Project ID missing in WebSocket URL");
    }
}
