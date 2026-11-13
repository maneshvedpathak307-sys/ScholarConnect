package com.scholarship.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewRequest(

        @NotBlank(message = "Review remarks are required.")
        @Size(max = 2000, message = "Remarks cannot exceed 2000 characters.")
        String remarks

) {}