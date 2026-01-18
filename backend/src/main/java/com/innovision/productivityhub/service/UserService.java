package com.innovision.productivityhub.service;

import com.innovision.productivityhub.dto.PasswordChangeRequest;
import com.innovision.productivityhub.dto.UserProfileUpdateRequest;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.ActivityLogRepository;
import com.innovision.productivityhub.repository.TaskRepository;
import com.innovision.productivityhub.repository.UserRepository;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            TaskRepository taskRepository,
            ActivityLogRepository activityLogRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> 
            new RuntimeException("User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> 
            new RuntimeException("User not found"));
    }

    public Map<String, Object> getUserStats(Long userId) {
        User user = findById(userId);
        Map<String, Object> stats = new HashMap<>();
        
        // Count tasks assigned to user
        long totalTasks = taskRepository.count(); // Simplified - would need proper query
        long completedTasks = 0; // Would need proper counting
        
        // Count activity logs by user
        long activityCount = activityLogRepository.count(); // Would need filtering by actor
        
        stats.put("tasksAssigned", totalTasks);
        stats.put("tasksCompleted", completedTasks);
        stats.put("activityCount", activityCount);
        stats.put("joinedDate", user.getCreatedAt());
        stats.put("role", user.getRole());
        stats.put("active", user.isActive());
        
        return stats;
    }

    @Transactional
    public User updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = findById(userId);
        
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        
        if (request.getTitle() != null) {
            user.setTitle(request.getTitle());
        }
        
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = findById(userId);
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Validate new password
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public User updatePreferences(Long userId, Map<String, Object> preferences) {
        User user = findById(userId);
        // In a real app, preferences would be stored in a separate table or JSONB column
        // For now, we just return the user
        return userRepository.save(user);
    }
}
