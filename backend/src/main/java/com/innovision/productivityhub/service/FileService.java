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
import java.util.Optional;
import java.util.UUID;
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
        
        // Generate unique filename
        String fileExtension = multipartFile.getOriginalFilename().substring(
                multipartFile.getOriginalFilename().lastIndexOf("."));
        String uniqueFileName = UUID.randomUUID() + fileExtension;
        Path destination = STORAGE_ROOT.resolve(projectId.toString()).resolve(uniqueFileName);
        
        Files.createDirectories(destination.getParent());
        Files.copy(multipartFile.getInputStream(), destination);
        file.setStoragePath(destination.toString());
        FileItem savedFile = fileItemRepository.save(file);

        FileVersion version = new FileVersion();
        version.setFileItem(savedFile);
        version.setVersionLabel("v1");
        version.setStoragePath(destination.toString());
        version.setSizeInBytes(multipartFile.getSize());
        version.setUploadedBy(uploader);
        fileVersionRepository.save(version);

        return savedFile;
    }

    public FileItem uploadNewVersion(Long fileId, MultipartFile multipartFile, String uploaderEmail) throws IOException {
        FileItem file = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        User uploader = userRepository.findByEmail(uploaderEmail).orElse(null);

        // Get current version count
        List<FileVersion> versions = fileVersionRepository.findByFileItemId(fileId);
        int nextVersionNumber = versions.size() + 1;

        // Generate unique filename
        String fileExtension = file.getName().substring(file.getName().lastIndexOf("."));
        String uniqueFileName = UUID.randomUUID() + "_v" + nextVersionNumber + fileExtension;
        Path destination = STORAGE_ROOT.resolve(file.getProject().getId().toString()).resolve(uniqueFileName);

        Files.createDirectories(destination.getParent());
        Files.copy(multipartFile.getInputStream(), destination);

        // Update file metadata
        file.setContentType(multipartFile.getContentType());
        file.setSizeInBytes(multipartFile.getSize());
        file.setStoragePath(destination.toString());
        FileItem updatedFile = fileItemRepository.save(file);

        // Create new version
        FileVersion version = new FileVersion();
        version.setFileItem(updatedFile);
        version.setVersionLabel("v" + nextVersionNumber);
        version.setStoragePath(destination.toString());
        version.setSizeInBytes(multipartFile.getSize());
        version.setUploadedBy(uploader);
        fileVersionRepository.save(version);

        return updatedFile;
    }

    public List<FileItem> forProject(Long projectId) {
        return fileItemRepository.findByProjectId(projectId);
    }

    public List<FileVersion> getFileVersions(Long fileId) {
        return fileVersionRepository.findByFileItemId(fileId);
    }

    public Optional<FileVersion> getVersion(Long fileId, String versionLabel) {
        List<FileVersion> versions = fileVersionRepository.findByFileItemId(fileId);
        return versions.stream()
                .filter(v -> v.getVersionLabel().equals(versionLabel))
                .findFirst();
    }

    public FileItem restoreVersion(Long fileId, String versionLabel, String uploaderEmail) throws IOException {
        FileItem file = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        User uploader = userRepository.findByEmail(uploaderEmail).orElse(null);

        Optional<FileVersion> targetVersion = getVersion(fileId, versionLabel);
        if (targetVersion.isEmpty()) {
            throw new RuntimeException("Version not found");
        }

        // Get current version count
        List<FileVersion> versions = fileVersionRepository.findByFileItemId(fileId);
        int nextVersionNumber = versions.size() + 1;

        // Copy target version file to new version
        String fileExtension = file.getName().substring(file.getName().lastIndexOf("."));
        String uniqueFileName = UUID.randomUUID() + "_restored" + fileExtension;
        Path newPath = STORAGE_ROOT.resolve(file.getProject().getId().toString()).resolve(uniqueFileName);

        Files.createDirectories(newPath.getParent());
        Files.copy(Paths.get(targetVersion.get().getStoragePath()), newPath);

        // Update file
        file.setStoragePath(newPath.toString());
        file.setSizeInBytes(targetVersion.get().getSizeInBytes());
        FileItem updatedFile = fileItemRepository.save(file);

        // Create new version from restored
        FileVersion restoredVersion = new FileVersion();
        restoredVersion.setFileItem(updatedFile);
        restoredVersion.setVersionLabel("v" + nextVersionNumber);
        restoredVersion.setStoragePath(newPath.toString());
        restoredVersion.setSizeInBytes(targetVersion.get().getSizeInBytes());
        restoredVersion.setUploadedBy(uploader);
        fileVersionRepository.save(restoredVersion);

        return updatedFile;
    }

    public void deleteFile(Long fileId) throws IOException {
        FileItem file = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Delete all versions
        List<FileVersion> versions = fileVersionRepository.findByFileItemId(fileId);
        for (FileVersion version : versions) {
            Files.deleteIfExists(Paths.get(version.getStoragePath()));
        }

        // Delete current file
        Files.deleteIfExists(Paths.get(file.getStoragePath()));

        // Delete from database
        fileItemRepository.delete(file);
    }
}
