package com.scholarship.portal.controller;

import com.scholarship.portal.dto.*;
import com.scholarship.portal.service.AuthService;
import com.scholarship.portal.service.PasswordResetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final PasswordResetService passwordResetService;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.register(request));
    }

    // LOGIN
    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        return service.login(request);
    }

    // STEP 1: SEND OTP TO EMAIL
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(
            @Valid @RequestBody ForgotPasswordRequest request) {

        String message =
                passwordResetService.sendOtp(request);

        return ResponseEntity.ok(
                java.util.Map.of("message", message)
        );
    }

    // STEP 2: GET CAPTCHA IMAGE
    @GetMapping("/forgot-password/captcha")
    public ResponseEntity<CaptchaResponse> captcha(
            @RequestParam String email) {

        return ResponseEntity.ok(
                passwordResetService.generateCaptcha(email)
        );
    }

    // STEP 3: VERIFY OTP AND CAPTCHA
    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        String resetToken =
                passwordResetService.verifyOtp(request);

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message", "Email verified successfully.",
                        "resetToken", resetToken
                )
        );
    }

    // STEP 4: RESET PASSWORD
    @PostMapping("/forgot-password/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        String message =
                passwordResetService.resetPassword(request);

        return ResponseEntity.ok(
                java.util.Map.of("message", message)
        );
    }
}