package com.scholarship.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VerifyOtpRequest(

        @NotBlank
        @Size(max = 150)
        String email,

        @NotBlank
        @Pattern(regexp = "^[0-9]{6}$")
        String otp,

        @NotBlank
        String captchaId,

        @NotBlank
        @Size(min = 4, max = 8)
        String captchaText

) {}