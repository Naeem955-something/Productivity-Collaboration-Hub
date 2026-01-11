package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.Document;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProjectId(Long projectId);
    List<Document> findByTitleContainingIgnoreCase(String keyword);
}
