package com.innovision.productivityhub.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovision.productivityhub.model.ChatMessage;
import com.innovision.productivityhub.model.Project;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.ChatMessageRepository;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.repository.UserRepository;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat/{projectId}")
    public void handleChatMessage(ChatMessageDTO messageDTO, @DestinationVariable Long projectId) {
        try {
            // Create and save message
            ChatMessage message = new ChatMessage();
            message.setContent(messageDTO.getContent());
            message.setType("MESSAGE");

            Project project = projectRepository.findById(projectId).orElse(null);
            message.setProject(project);

            ChatMessage savedMessage = chatMessageRepository.save(message);

            // Broadcast to all subscribers
            messagingTemplate.convertAndSend(
                "/topic/chat/" + projectId,
                new ChatMessageResponse(
                    savedMessage.getId(),
                    savedMessage.getContent(),
                    messageDTO.getSenderName(),
                    messageDTO.getSenderAvatar(),
                    System.currentTimeMillis(),
                    "MESSAGE"
                )
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @MessageMapping("/chat/{projectId}/typing")
    public void handleTypingIndicator(TypingDTO typingDTO, @DestinationVariable Long projectId) {
        messagingTemplate.convertAndSend(
            "/topic/chat/" + projectId + "/typing",
            new TypingResponse(
                typingDTO.getUserName(),
                typingDTO.isTyping()
            )
        );
    }

    // DTO classes
    public static class ChatMessageDTO {
        private String content;
        private String senderName;
        private String senderAvatar;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getSenderName() {
            return senderName;
        }

        public void setSenderName(String senderName) {
            this.senderName = senderName;
        }

        public String getSenderAvatar() {
            return senderAvatar;
        }

        public void setSenderAvatar(String senderAvatar) {
            this.senderAvatar = senderAvatar;
        }
    }

    public static class ChatMessageResponse {
        private Long id;
        private String content;
        private String senderName;
        private String senderAvatar;
        private Long timestamp;
        private String type;

        public ChatMessageResponse(Long id, String content, String senderName, String senderAvatar, Long timestamp, String type) {
            this.id = id;
            this.content = content;
            this.senderName = senderName;
            this.senderAvatar = senderAvatar;
            this.timestamp = timestamp;
            this.type = type;
        }

        public Long getId() { return id; }
        public String getContent() { return content; }
        public String getSenderName() { return senderName; }
        public String getSenderAvatar() { return senderAvatar; }
        public Long getTimestamp() { return timestamp; }
        public String getType() { return type; }
    }

    public static class TypingDTO {
        private String userName;
        private boolean typing;

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public boolean isTyping() { return typing; }
        public void setTyping(boolean typing) { this.typing = typing; }
    }

    public static class TypingResponse {
        private String userName;
        private boolean typing;

        public TypingResponse(String userName, boolean typing) {
            this.userName = userName;
            this.typing = typing;
        }

        public String getUserName() { return userName; }
        public boolean isTyping() { return typing; }
    }
}
