package com.innovision.productivityhub.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "activity_logs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ActivityLog extends BaseEntity {
    private String action;
    private String details;
    private String severity;

    @ManyToOne(fetch = FetchType.LAZY)
    private User actor;
}
