package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.model.ChatMessage;
import com.innovision.productivityhub.service.ChatService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {
    @Autowired
    private ChatService chatService;

    @GetMapping("/projects/{projectId}/messages")
    public ResponseEntity<List<ChatMessage>> getProjectMessages(@PathVariable Long projectId) {
        List<ChatMessage> messages = chatService.getProjectMessages(projectId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessageRequest request) {
        ChatMessage message = chatService.sendMessage(request.getProjectId(), request.getUserId(), request.getContent());
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<ChatMessage> deleteMessage(@PathVariable Long messageId) {
        ChatMessage message = chatService.deleteMessage(messageId);
        return ResponseEntity.ok(message);
    }

    public static class ChatMessageRequest {
        private Long projectId;
        private Long userId;
        private String content;

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
