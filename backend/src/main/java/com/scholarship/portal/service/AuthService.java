package com.scholarship.portal.service;

import com.scholarship.portal.dto.*;
import com.scholarship.portal.entity.User;
import com.scholarship.portal.enums.Role;
import com.scholarship.portal.repository.UserRepository;
import com.scholarship.portal.security.JwtService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwt;

    // Student registration
    public AuthResponse register(RegisterRequest r) {

        String email = r.email().trim().toLowerCase();

        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        User user = new User();

        user.setFullName(r.fullName().trim());
        user.setEmail(email);
        user.setPassword(encoder.encode(r.password()));
        user.setMobileNumber(r.mobileNumber().trim());

        // New personal information
        user.setDateOfBirth(r.dateOfBirth());
        user.setGender(r.gender());

        user.setRole(Role.STUDENT);

        user = users.save(user);

        return response(user);
    }

    // Student/Admin login
    public AuthResponse login(LoginRequest r) {

        String email = r.email().trim().toLowerCase();

        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        r.password()
                )
        );

        User user = users.findByEmail(email)
                .orElseThrow();

        return response(user);
    }

    // Generate JWT response
    private AuthResponse response(User user) {

        return new AuthResponse(
                jwt.generateToken(user),
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}