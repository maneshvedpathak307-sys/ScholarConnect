package com.scholarship.portal.dto;

import java.time.LocalDateTime;

public record StudentResponse(
        Long id,
        String fullName,
        String email,
        String mobileNumber,
        LocalDateTime createdAt,
        boolean enabled
) {
}