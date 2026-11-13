package com.scholarship.portal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "password_reset_challenges",
    uniqueConstraints = @UniqueConstraint(columnNames = "email")
)
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 100)
    private String otpHash;

    private LocalDateTime otpExpiresAt;

    private LocalDateTime resendAvailableAt;

    private int otpAttempts;

    @Column(length = 36)
    private String captchaId;

    @Column(length = 64)
    private String captchaAnswerHash;

    private LocalDateTime captchaExpiresAt;

    private int captchaAttempts;

    @Column(length = 64)
    private String resetTokenHash;

    private LocalDateTime resetTokenExpiresAt;

    private LocalDateTime createdAt = LocalDateTime.now();
}