package com.innovision.controller;

import com.innovision.model.Message;
import com.innovision.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Get all messages for a specific project
     * @param projectId Project ID
     * @return List of messages
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Message>> getProjectMessages(@PathVariable Long projectId) {
        List<Message> messages = chatService.getMessagesByProject(projectId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Send a message via REST API (optional, main chat uses WebSocket)
     * @param message Message object
     * @return Saved message
     */
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        Message saved = chatService.saveMessage(message);
        return ResponseEntity.ok(saved);
    }
}
