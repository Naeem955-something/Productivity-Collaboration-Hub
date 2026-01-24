package com.innovision.websocket;

import com.innovision.model.WhiteboardSession;
import com.innovision.service.WhiteboardService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WhiteboardWebSocket {

    private final WhiteboardService whiteboardService;

    public WhiteboardWebSocket(WhiteboardService whiteboardService) {
        this.whiteboardService = whiteboardService;
    }

    /**
     * Receive drawing events from client
     * URL: /app/whiteboard/{projectId}
     */
    @MessageMapping("/whiteboard/{projectId}")
    @SendTo("/topic/whiteboard/{projectId}")
    public WhiteboardSession handleDrawEvent(
            @DestinationVariable Long projectId,
            String eventJson
    ) {
        whiteboardService.addEvent(projectId, eventJson);
        return whiteboardService.getSession(projectId);
    }

    /**
     * Clear board event
     * URL: /app/whiteboard/{projectId}/clear
     */
    @MessageMapping("/whiteboard/{projectId}/clear")
    @SendTo("/topic/whiteboard/{projectId}")
    public WhiteboardSession clearBoard(
            @DestinationVariable Long projectId
    ) {
        whiteboardService.clearBoard(projectId);
        return whiteboardService.getSession(projectId);
    }
}
