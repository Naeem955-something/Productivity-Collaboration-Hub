package com.innovision.productivityhub.dto;

import com.innovision.productivityhub.model.User;

public record AuthResponse(String token, User user) { }
