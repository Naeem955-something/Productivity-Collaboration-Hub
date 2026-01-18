package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.DocumentVersion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {
    List<DocumentVersion> findByDocumentIdOrderByVersionNumberDesc(Long documentId);
    DocumentVersion findByDocumentIdAndVersionNumber(Long documentId, int versionNumber);
}
