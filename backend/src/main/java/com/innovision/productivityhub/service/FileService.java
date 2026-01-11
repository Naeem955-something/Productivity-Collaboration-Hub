package com.innovision.productivityhub.service;

import com.innovision.productivityhub.model.FileItem;
import com.innovision.productivityhub.model.FileVersion;
import com.innovision.productivityhub.model.Project;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.FileItemRepository;
import com.innovision.productivityhub.repository.FileVersionRepository;
import com.innovision.productivityhub.repository.ProjectRepository;
import com.innovision.productivityhub.repository.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {
    private static final Path STORAGE_ROOT = Paths.get("uploads");

    private final FileItemRepository fileItemRepository;
    private final FileVersionRepository fileVersionRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public FileService(FileItemRepository fileItemRepository,
                       FileVersionRepository fileVersionRepository,
                       ProjectRepository projectRepository,
                       UserRepository userRepository) {
        this.fileItemRepository = fileItemRepository;
        this.fileVersionRepository = fileVersionRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public FileItem upload(Long projectId, MultipartFile multipartFile, String uploaderEmail) throws IOException {
        if (!Files.exists(STORAGE_ROOT)) {
            Files.createDirectories(STORAGE_ROOT);
        }
        Project project = projectRepository.findById(projectId).orElseThrow();
        User uploader = userRepository.findByEmail(uploaderEmail).orElse(null);

        FileItem file = new FileItem();
        file.setName(multipartFile.getOriginalFilename());
        file.setContentType(multipartFile.getContentType());
        file.setSizeInBytes(multipartFile.getSize());
        file.setProject(project);
        Path destination = STORAGE_ROOT.resolve(multipartFile.getOriginalFilename());
        Files.copy(multipartFile.getInputStream(), destination);
        file.setStoragePath(destination.toString());
        fileItemRepository.save(file);

        FileVersion version = new FileVersion();
        version.setFileItem(file);
        version.setVersionLabel("v" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(java.time.LocalDateTime.now()));
        version.setStoragePath(destination.toString());
        version.setSizeInBytes(multipartFile.getSize());
        version.setUploadedBy(uploader);
        fileVersionRepository.save(version);

        return file;
    }

    public List<FileItem> forProject(Long projectId) {
        return fileItemRepository.findByProjectId(projectId);
    }
}
