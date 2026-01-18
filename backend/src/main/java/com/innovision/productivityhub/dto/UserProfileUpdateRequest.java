package com.innovision.productivityhub.dto;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String name;
    private String title;
    private String avatarUrl;

    public String getName() {
        return name;
    }

    public String getTitle() {
        return title;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }
}
