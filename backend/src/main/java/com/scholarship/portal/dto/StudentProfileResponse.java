package com.scholarship.portal.dto;

import java.time.LocalDate;

public record StudentProfileResponse(
        Long id,
        String fullName,
        String email,
        String mobileNumber,
        LocalDate dateOfBirth,
        String gender
) {}