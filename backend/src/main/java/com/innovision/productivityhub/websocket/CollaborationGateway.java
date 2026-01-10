package com.innovision.productivityhub.websocket;

import com.innovision.productivityhub.dto.MessagePayload;
import com.innovision.productivityhub.model.Message;
import com.innovision.productivityhub.service.MessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class CollaborationGateway {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    public CollaborationGateway(SimpMessagingTemplate messagingTemplate, MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    @MessageMapping("/chat/{projectId}")
    public void chat(@DestinationVariable Long projectId, @Payload MessagePayload payload) {
        Message saved = messageService.save(new MessagePayload(projectId, payload.channel(), payload.content()), null);
        messagingTemplate.convertAndSend("/topic/chat/" + projectId, saved);
    }

    @MessageMapping("/whiteboard/{projectId}")
    public void whiteboard(@DestinationVariable Long projectId, @Payload String stroke) {
        messagingTemplate.convertAndSend("/topic/whiteboard/" + projectId, stroke);
    }

    @MessageMapping("/notifications/{userId}")
    public void notifications(@DestinationVariable Long userId, @Payload String payload) {
        messagingTemplate.convertAndSend("/queue/notifications/" + userId, payload);
    }
}
