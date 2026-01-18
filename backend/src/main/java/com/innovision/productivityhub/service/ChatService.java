package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.ChatMessage;
import com.innovision.productivityhub.model.Project;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.ChatMessageRepository;
import com.innovision.productivityhub.repository.ProjectRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public ChatMessage sendMessage(Long projectId, Long userId, String content) {
        // Note: In real implementation, fetch actual User from database
        ChatMessage message = new ChatMessage();
        message.setContent(content);
        message.setType("MESSAGE");
        
        Project project = projectRepository.findById(projectId).orElse(null);
        message.setProject(project);

        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getProjectMessages(Long projectId) {
        return chatMessageRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
    }

    public ChatMessage deleteMessage(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId).orElse(null);
        if (message != null) {
            chatMessageRepository.deleteById(messageId);
        }
        return message;
    }
}
