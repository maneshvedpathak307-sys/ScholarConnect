package com.scholarship.portal.dto;

public record CaptchaResponse(
        String captchaId,
        String image
) {}