package com.innovision.productivityhub.controller;

import com.innovision.productivityhub.dto.PasswordChangeRequest;
import com.innovision.productivityhub.dto.UserProfileUpdateRequest;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.service.UserService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserStats(id));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<User> updateProfile(
            @PathVariable Long id,
            @RequestBody UserProfileUpdateRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userService.findByEmail(email);
        
        if (!currentUser.getId().equals(id) && currentUser.getRole() != com.innovision.productivityhub.model.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody PasswordChangeRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userService.findByEmail(email);
        
        if (!currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        
        try {
            userService.changePassword(id, request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/preferences")
    public ResponseEntity<User> updatePreferences(
            @PathVariable Long id,
            @RequestBody Map<String, Object> preferences,
            Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userService.findByEmail(email);
        
        if (!currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(userService.updatePreferences(id, preferences));
    }
}
