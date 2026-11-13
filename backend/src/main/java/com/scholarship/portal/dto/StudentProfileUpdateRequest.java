package com.scholarship.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record StudentProfileUpdateRequest(

        @NotBlank
        @Size(max = 100)
        String fullName,

        @Pattern(
                regexp = "^$|^[0-9+() -]{7,15}$",
                message = "Enter a valid mobile number."
        )
        String mobileNumber,

        LocalDate dateOfBirth,

        @Size(max = 20)
        String gender
) {
}