package com.scholarship.portal.service;

import com.scholarship.portal.dto.StudentResponse;
import com.scholarship.portal.entity.User;
import com.scholarship.portal.enums.Role;
import com.scholarship.portal.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository userRepository;

    public List<StudentResponse> getAllStudents() {

        return userRepository
                .findByRoleOrderByCreatedAtDesc(Role.STUDENT)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private StudentResponse toResponse(User user) {

        return new StudentResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getCreatedAt(),
                user.isEnabled()
        );
    }
}