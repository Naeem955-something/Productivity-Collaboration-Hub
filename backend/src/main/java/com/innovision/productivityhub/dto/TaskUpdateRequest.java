package com.innovision.productivityhub.dto;

import com.innovision.productivityhub.model.Priority;
import com.innovision.productivityhub.model.TaskStatus;
import java.time.LocalDate;

public record TaskUpdateRequest(String title,
                                String description,
                                TaskStatus status,
                                Priority priority,
                                LocalDate dueDate) { }
