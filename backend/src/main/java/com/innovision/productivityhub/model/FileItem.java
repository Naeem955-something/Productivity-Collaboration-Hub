package com.innovision.productivityhub.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "files")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FileItem extends BaseEntity {
    private String name;
    private String storagePath;
    private long sizeInBytes;
    private String contentType;

    @ManyToOne(fetch = FetchType.LAZY)
    private Project project;

    @OneToMany(mappedBy = "fileItem", fetch = FetchType.LAZY)
    private Set<FileVersion> versions = new HashSet<>();

    // Explicit getter and setter methods (replacing Lombok annotations for Java 25 compatibility)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public long getSizeInBytes() {
        return sizeInBytes;
    }

    public void setSizeInBytes(long sizeInBytes) {
        this.sizeInBytes = sizeInBytes;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Set<FileVersion> getVersions() {
        return versions;
    }

    public void setVersions(Set<FileVersion> versions) {
        this.versions = versions;
    }

    // BaseEntity getters and setters
    @Override
    public Long getId() {
        return super.getId();
    }

    @Override
    public void setId(Long id) {
        super.setId(id);
    }

    @Override
    public Instant getCreatedAt() {
        return super.getCreatedAt();
    }

    @Override
    public void setCreatedAt(Instant createdAt) {
        super.setCreatedAt(createdAt);
    }

    @Override
    public Instant getUpdatedAt() {
        return super.getUpdatedAt();
    }

    @Override
    public void setUpdatedAt(Instant updatedAt) {
        super.setUpdatedAt(updatedAt);
    }
}
