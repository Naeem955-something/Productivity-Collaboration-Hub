package com.innovision.productivityhub.dto;

import java.time.LocalDate;

public record ProjectRequest(String name,
                             String description,
                             String status,
                             LocalDate startDate,
                             LocalDate endDate,
                             Long teamId) { }
