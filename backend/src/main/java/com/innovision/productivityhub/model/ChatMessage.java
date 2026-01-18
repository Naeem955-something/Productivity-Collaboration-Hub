package com.innovision.productivityhub.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chat_messages")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChatMessage extends BaseEntity {
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonBackReference
    private Project project;

    private String type; // MESSAGE, SYSTEM, NOTIFICATION

    public String getSender() {
        return sender != null ? sender.getName() : "Unknown";
    }

    public String getSenderEmail() {
        return sender != null ? sender.getEmail() : "";
    }

    public Long getSenderId() {
        return sender != null ? sender.getId() : null;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Project getProject() {
        return project;
    }

    public String getType() {
        return type != null ? type : "MESSAGE";
    }

    public void setType(String type) {
        this.type = type;
    }
}
