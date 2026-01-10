package com.innovision.productivityhub.service;

import com.innovision.productivityhub.dto.AuthRequest;
import com.innovision.productivityhub.dto.AuthResponse;
import com.innovision.productivityhub.dto.RegisterRequest;
import com.innovision.productivityhub.model.Role;
import com.innovision.productivityhub.model.Team;
import com.innovision.productivityhub.model.User;
import com.innovision.productivityhub.repository.TeamRepository;
import com.innovision.productivityhub.repository.UserRepository;
import com.innovision.productivityhub.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       TeamRepository teamRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(u -> {
            throw new IllegalArgumentException("Email already registered");
        });
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.MEMBER);

        if (request.teamName() != null && !request.teamName().isBlank()) {
            Team team = new Team();
            team.setName(request.teamName());
            teamRepository.save(team);
            user.getTeams().add(team);
            team.getMembers().add(user);
        }

        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user);
    }
}
