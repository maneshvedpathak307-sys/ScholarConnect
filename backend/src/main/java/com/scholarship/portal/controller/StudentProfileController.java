package com.scholarship.portal.controller;

import com.scholarship.portal.dto.StudentProfileResponse;
import com.scholarship.portal.dto.StudentProfileUpdateRequest;
import com.scholarship.portal.entity.User;
import com.scholarship.portal.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/student/profile")
@RequiredArgsConstructor
public class StudentProfileController {

    private final UserRepository userRepository;

    // GET STUDENT PROFILE
    @GetMapping
    public StudentProfileResponse getProfile(
            @AuthenticationPrincipal User user) {

        return toResponse(user);
    }

    // UPDATE STUDENT PROFILE
    @PutMapping
    public StudentProfileResponse updateProfile(
            @AuthenticationPrincipal User authenticatedUser,
            @Valid @RequestBody StudentProfileUpdateRequest request) {

        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student profile not found."
                ));

        user.setFullName(request.fullName().trim());
        user.setMobileNumber(request.mobileNumber());
        user.setDateOfBirth(request.dateOfBirth());
        user.setGender(request.gender());

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    private StudentProfileResponse toResponse(User user) {

        return new StudentProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getDateOfBirth(),
                user.getGender()
        );
    }
}