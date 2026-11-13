package com.scholarship.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ScholarshipRequest(

        @NotBlank
        String name,

        String description,

        @NotBlank
        @Pattern(regexp = "^(UG|PG)$",
                message = "Education level must be UG or PG")
        String educationLevel,

        @NotBlank
        @Pattern(
                regexp = "^(OPEN|EWS|OBC|SC|ST|VJNT / NT|SBC|MINORITY)$",
                message = "Invalid scholarship category"
        )
        String eligibleCategory,

        String eligibleCourse,

        BigDecimal maximumFamilyIncome,

        BigDecimal awardAmount,

        LocalDate startDate,

        LocalDate endDate,

        Boolean active

) {}