package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.FileVersion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileVersionRepository extends JpaRepository<FileVersion, Long> {
    List<FileVersion> findByFileItemId(Long fileItemId);
}
