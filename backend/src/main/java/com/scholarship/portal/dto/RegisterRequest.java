package com.scholarship.portal.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record RegisterRequest(

        @NotBlank
        @Size(max = 100)
        String fullName,

        @NotBlank
        @Email
        @Size(max = 150)
        String email,

        @NotBlank
        @Size(min = 8, max = 72)
        String password,

        @NotBlank
        @Pattern(regexp = "^[0-9+ -]{10,15}$")
        String mobileNumber,

        @NotNull
        @Past
        LocalDate dateOfBirth,

        @NotBlank
        @Pattern(
                regexp = "^(Male|Female|Other)$",
                message = "Gender must be Male, Female or Other"
        )
        String gender

) {}