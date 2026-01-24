package com.innovision.productivityhub.service;

// Import the necessary model and repository classes
import com.innovision.productivityhub.model.ChatMessage;
import com.innovision.productivityhub.model.Project;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.ChatMessageRepository;
import com.innovision.productivityhub.repository.ProjectRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// Mark this class as a Spring Service
// This layer contains business logic for chat feature
@Service
public class ChatService {

    // Inject repository to interact with ChatMessage table
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    // Inject repository to interact with Project table
    @Autowired
    private ProjectRepository projectRepository;

    /**
     * Send a chat message in a project
     * @param projectId - ID of the project chat
     * @param userId - ID of the sender (for real app, you would fetch actual User object)
     * @param content - The message text
     * @return saved ChatMessage
     */
    public ChatMessage sendMessage(Long projectId, Long userId, String content) {
        // Create a new ChatMessage object
        ChatMessage message = new ChatMessage();

        // Set the message text
        message.setContent(content);

        // Set the type of message (can be MESSAGE, SYSTEM, etc.)
        message.setType("MESSAGE");
        
        // Fetch the project from DB using projectId
        Project project = projectRepository.findById(projectId).orElse(null);

        // Link message to the project
        message.setProject(project);

        // Save the message to database and return saved entity
        return chatMessageRepository.save(message);
    }

    /**
     * Fetch all messages for a project in chronological order
     * @param projectId - ID of the project
     * @return List of ChatMessage
     */
    public List<ChatMessage> getProjectMessages(Long projectId) {
        // Use custom repository method to get messages by projectId sorted by creation time
        return chatMessageRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
    }

    /**
     * Delete a message by its ID
     * @param messageId - ID of the message to delete
     * @return deleted message object (or null if not found)
     */
    public ChatMessage deleteMessage(Long messageId) {
        // Find the message in DB
        ChatMessage message = chatMessageRepository.findById(messageId).orElse(null);

        // If message exists, delete it
        if (message != null) {
            chatMessageRepository.deleteById(messageId);
        }

        // Return the deleted message object (so frontend can update UI)
        return message;
    }
}
