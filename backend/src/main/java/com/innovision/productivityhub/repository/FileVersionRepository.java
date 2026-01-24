package com.innovision.productivityhub.repository;

import com.innovision.productivityhub.model.FileVersion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileVersionRepository extends JpaRepository<FileVersion, Long> {
    List<FileVersion> findByFileItemId(Long fileItemId);
}
