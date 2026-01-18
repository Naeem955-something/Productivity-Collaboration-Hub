package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.model.FileItem;
import com.innovision.productivityhub.model.FileVersion;
import com.innovision.productivityhub.service.FileService;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<FileItem>> files(@PathVariable Long projectId) {
        return ResponseEntity.ok(fileService.forProject(projectId));
    }

    @PostMapping("/project/{projectId}/upload")
    public ResponseEntity<FileItem> upload(@PathVariable Long projectId,
                                           @RequestParam("file") MultipartFile multipartFile,
                                           Principal principal) throws IOException {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(fileService.upload(projectId, multipartFile, email));
    }

    @PostMapping("/{fileId}/upload-version")
    public ResponseEntity<FileItem> uploadNewVersion(
            @PathVariable Long fileId,
            @RequestParam("file") MultipartFile multipartFile,
            Principal principal) throws IOException {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(fileService.uploadNewVersion(fileId, multipartFile, email));
    }

    @GetMapping("/{fileId}/versions")
    public ResponseEntity<List<FileVersion>> getVersions(@PathVariable Long fileId) {
        return ResponseEntity.ok(fileService.getFileVersions(fileId));
    }

    @PostMapping("/{fileId}/restore/{versionLabel}")
    public ResponseEntity<FileItem> restoreVersion(
            @PathVariable Long fileId,
            @PathVariable String versionLabel,
            Principal principal) throws IOException {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(fileService.restoreVersion(fileId, versionLabel, email));
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) {
        try {
            fileService.deleteFile(fileId);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
