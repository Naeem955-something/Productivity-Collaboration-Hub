package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.FileItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileItemRepository extends JpaRepository<FileItem, Long> {
    List<FileItem> findByProjectId(Long projectId);
}
