// Define package for WebSocket components
package com.innovision.websocket;

// Import the model representing a whiteboard session
import com.innovision.model.WhiteboardSession;

// Import the service handling whiteboard logic (events, session management)
import com.innovision.service.WhiteboardService;

// Spring annotations for handling WebSocket messages
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;

// Mark this class as a Spring Controller to handle messaging endpoints
import org.springframework.stereotype.Controller;

@Controller  // This tells Spring that this class handles WebSocket messages
public class WhiteboardWebSocket {

    // Inject WhiteboardService to delegate logic (saving events, session state)
    private final WhiteboardService whiteboardService;

    // Constructor injection of WhiteboardService
    public WhiteboardWebSocket(WhiteboardService whiteboardService) {
        this.whiteboardService = whiteboardService;
    }

    /**
     * Handle drawing events from the client
     * Client sends drawing updates here
     * Example URL: /app/whiteboard/5
     * - projectId is extracted from URL
     * - eventJson contains drawing data (line, shape, color, etc.)
     * Sends updated session to all subscribers of the topic
     */
    @MessageMapping("/whiteboard/{projectId}")  // Maps incoming messages to this method
    @SendTo("/topic/whiteboard/{projectId}")   // Broadcast result to all subscribed clients
    public WhiteboardSession handleDrawEvent(
            @DestinationVariable Long projectId, // Get projectId from the URL
            String eventJson                     // Drawing action from frontend
    ) {
        // Save the drawing event in backend session
        whiteboardService.addEvent(projectId, eventJson);

        // Return the full session to all clients (to sync their boards)
        return whiteboardService.getSession(projectId);
    }

    /**
     * Handle "Clear Board" action
     * Client requests to clear all drawings
     * Example URL: /app/whiteboard/5/clear
     * - projectId is extracted from URL
     * Broadcasts cleared session to all subscribers
     */
    @MessageMapping("/whiteboard/{projectId}/clear") // Maps clear requests
    @SendTo("/topic/whiteboard/{projectId}")        // Broadcast cleared session
    public WhiteboardSession clearBoard(
            @DestinationVariable Long projectId // Get projectId from URL
    ) {
        // Clear all events in the backend session
        whiteboardService.clearBoard(projectId);

        // Return the cleared session to all clients (frontend boards reset)
        return whiteboardService.getSession(projectId);
    }
}
