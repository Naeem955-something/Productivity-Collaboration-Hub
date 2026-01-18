package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.ChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<ChatMessage> findByProjectIdOrderByCreatedAtAsc(Long projectId);
}
