package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.Message;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
