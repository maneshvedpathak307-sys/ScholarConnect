package com.scholarship.portal.service;

import com.scholarship.portal.dto.CaptchaResponse;
import com.scholarship.portal.dto.ForgotPasswordRequest;
import com.scholarship.portal.dto.ResetPasswordRequest;
import com.scholarship.portal.dto.VerifyOtpRequest;
import com.scholarship.portal.entity.PasswordResetChallenge;
import com.scholarship.portal.entity.User;
import com.scholarship.portal.repository.PasswordResetChallengeRepository;
import com.scholarship.portal.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

import javax.imageio.ImageIO;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository users;
    private final PasswordResetChallengeRepository challenges;
    private final PasswordEncoder encoder;
    private final PasswordResetEmailService emailService;

    private final SecureRandom random = new SecureRandom();

    @Value("${app.password-reset.otp-expiry-minutes:5}")
    private long otpExpiryMinutes;

    @Value("${app.password-reset.resend-cooldown-seconds:60}")
    private long resendCooldownSeconds;

    @Value("${app.password-reset.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.password-reset.captcha-expiry-minutes:3}")
    private long captchaExpiryMinutes;

    @Value("${app.password-reset.token-expiry-minutes:10}")
    private long tokenExpiryMinutes;

    private static final String GENERIC_MESSAGE =
            "If the email is registered, an OTP will be sent shortly.";

    // STEP 1: SEND OTP

    @Transactional
    public String sendOtp(ForgotPasswordRequest request) {

        String email = normalizeEmail(request.email());
        LocalDateTime now = LocalDateTime.now();

        PasswordResetChallenge challenge =
                challenges.findByEmail(email)
                        .orElseGet(PasswordResetChallenge::new);

        if (challenge.getEmail() != null
                && challenge.getResendAvailableAt() != null
                && now.isBefore(challenge.getResendAvailableAt())) {

            return GENERIC_MESSAGE;
        }

        challenge.setEmail(email);
        challenge.setOtpHash(null);
        challenge.setOtpExpiresAt(null);
        challenge.setOtpAttempts(0);
        challenge.setCaptchaId(null);
        challenge.setCaptchaAnswerHash(null);
        challenge.setCaptchaExpiresAt(null);
        challenge.setCaptchaAttempts(0);
        challenge.setResetTokenHash(null);
        challenge.setResetTokenExpiresAt(null);
        challenge.setResendAvailableAt(
                now.plusSeconds(resendCooldownSeconds)
        );
        challenge.setCreatedAt(now);

        User user = users.findByEmail(email).orElse(null);

        if (user != null && user.isEnabled()) {

            String otp = generateOtp();

            challenge.setOtpHash(encoder.encode(otp));
            challenge.setOtpExpiresAt(
                    now.plusMinutes(otpExpiryMinutes)
            );

            challenges.save(challenge);

            emailService.sendOtp(email, otp);

        } else {
            challenges.save(challenge);
        }

        return GENERIC_MESSAGE;
    }

    // STEP 2: GENERATE CAPTCHA

    @Transactional
    public CaptchaResponse generateCaptcha(String rawEmail) {

        String email = normalizeEmail(rawEmail);

        PasswordResetChallenge challenge =
                challenges.findByEmail(email)
                        .orElseThrow(() ->
                                badRequest("Please request an OTP first.")
                        );

        LocalDateTime now = LocalDateTime.now();

        if (challenge.getOtpHash() == null
                || challenge.getOtpExpiresAt() == null
                || !now.isBefore(challenge.getOtpExpiresAt())) {

            throw badRequest(
                    "Your OTP has expired. Please request a new OTP."
            );
        }

        if (challenge.getOtpAttempts() >= maxAttempts) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many incorrect OTP attempts. Please request a new OTP after the cooldown."
            );
        }

        String captchaText = generateCaptchaText();
        String captchaId = UUID.randomUUID().toString();

        challenge.setCaptchaId(captchaId);
        challenge.setCaptchaAnswerHash(sha256(captchaText));
        challenge.setCaptchaExpiresAt(
                now.plusMinutes(captchaExpiryMinutes)
        );
        challenge.setCaptchaAttempts(0);

        challenges.save(challenge);

        return new CaptchaResponse(
                captchaId,
                createCaptchaImage(captchaText)
        );
    }

    // STEP 3: VERIFY OTP AND CAPTCHA

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public String verifyOtp(VerifyOtpRequest request) {

        String email = normalizeEmail(request.email());

        PasswordResetChallenge challenge =
                challenges.findByEmail(email)
                        .orElseThrow(() -> invalidVerification());

        LocalDateTime now = LocalDateTime.now();

        // Check OTP expiry.

        if (challenge.getOtpHash() == null
                || challenge.getOtpExpiresAt() == null
                || !now.isBefore(challenge.getOtpExpiresAt())) {

            throw badRequest(
                    "Your OTP has expired. Please request a new OTP."
            );
        }

        // Check OTP attempts.

        if (challenge.getOtpAttempts() >= maxAttempts) {

            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many incorrect OTP attempts. Please request a new OTP after the cooldown."
            );
        }

        // Check CAPTCHA availability and expiry.

        if (challenge.getCaptchaId() == null
                || challenge.getCaptchaExpiresAt() == null
                || !now.isBefore(challenge.getCaptchaExpiresAt())) {

            throw badRequest(
                    "CAPTCHA has expired. Please refresh the CAPTCHA."
            );
        }

        // Check CAPTCHA ID.

        if (!challenge.getCaptchaId().equals(request.captchaId())) {

            throw badRequest(
                    "Invalid CAPTCHA session. Please refresh the CAPTCHA."
            );
        }

        // Check CAPTCHA attempt limit.

        if (challenge.getCaptchaAttempts() >= maxAttempts) {

            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many incorrect CAPTCHA attempts. Please refresh the CAPTCHA."
            );
        }

        // Validate CAPTCHA answer.

        String submittedCaptcha =
                request.captchaText().trim().toUpperCase(Locale.ROOT);

        boolean captchaValid = constantTimeEquals(
                challenge.getCaptchaAnswerHash(),
                sha256(submittedCaptcha)
        );

        if (!captchaValid) {

            challenge.setCaptchaAttempts(
                    challenge.getCaptchaAttempts() + 1
            );

            challenges.save(challenge);

            throw badRequest(
                    "Incorrect CAPTCHA. Please enter the correct CAPTCHA."
            );
        }

        // CAPTCHA is correct. Consume this CAPTCHA.

        challenge.setCaptchaId(null);
        challenge.setCaptchaAnswerHash(null);
        challenge.setCaptchaExpiresAt(null);

        // Validate OTP.

        if (!encoder.matches(request.otp(), challenge.getOtpHash())) {

            challenge.setOtpAttempts(
                    challenge.getOtpAttempts() + 1
            );

            challenges.save(challenge);

            throw badRequest(
                    "Incorrect OTP. Please enter the correct six-digit OTP."
            );
        }

        // Verify registered account.

        User user = users.findByEmail(email)
                .orElseThrow(() -> invalidVerification());

        if (!user.isEnabled()) {
            throw invalidVerification();
        }

        // Generate single-use reset token.

        String resetToken = generateResetToken();

        challenge.setResetTokenHash(sha256(resetToken));

        challenge.setResetTokenExpiresAt(
                now.plusMinutes(tokenExpiryMinutes)
        );

        // OTP must not be reusable.

        challenge.setOtpHash(null);
        challenge.setOtpExpiresAt(null);
        challenge.setOtpAttempts(0);

        challenges.save(challenge);

        return resetToken;
    }

    // STEP 4: RESET PASSWORD

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {

        String email = normalizeEmail(request.email());

        if (request.resetToken() == null
                || request.resetToken().isBlank()) {

            throw badRequest(
                    "Password reset session is invalid. Please verify your email again."
            );
        }

        if (!request.newPassword().equals(request.confirmPassword())) {

            throw badRequest(
                    "New password and confirm password do not match."
            );
        }

        if (request.newPassword().length() < 8
                || request.newPassword().length() > 72) {

            throw badRequest(
                    "Password must contain between 8 and 72 characters."
            );
        }

        PasswordResetChallenge challenge =
                challenges.findByEmail(email)
                        .orElseThrow(() -> invalidVerification());

        if (challenge.getResetTokenHash() == null
                || challenge.getResetTokenExpiresAt() == null
                || !LocalDateTime.now().isBefore(
                        challenge.getResetTokenExpiresAt()
                )) {

            throw badRequest(
                    "Password reset session expired. Please verify your email again."
            );
        }

        boolean tokenValid = constantTimeEquals(
                challenge.getResetTokenHash(),
                sha256(request.resetToken())
        );

        if (!tokenValid) {
            throw invalidVerification();
        }

        User user = users.findByEmail(email)
                .orElseThrow(() -> invalidVerification());

        if (!user.isEnabled()) {
            throw invalidVerification();
        }

        user.setPassword(encoder.encode(request.newPassword()));

        users.save(user);

        // Delete challenge after successful password reset.

        challenges.delete(challenge);

        return "Password reset successfully. Please sign in.";
    }

    // CAPTCHA IMAGE

    private String createCaptchaImage(String text) {

        try {

            int width = 180;
            int height = 65;

            BufferedImage image = new BufferedImage(
                    width,
                    height,
                    BufferedImage.TYPE_INT_RGB
            );

            Graphics2D graphics = image.createGraphics();

            graphics.setRenderingHint(
                    RenderingHints.KEY_ANTIALIASING,
                    RenderingHints.VALUE_ANTIALIAS_ON
            );

            graphics.setColor(new Color(245, 248, 255));
            graphics.fillRect(0, 0, width, height);

            for (int i = 0; i < 8; i++) {

                graphics.setColor(
                        new Color(
                                random.nextInt(150),
                                random.nextInt(150),
                                random.nextInt(150),
                                90
                        )
                );

                graphics.drawLine(
                        random.nextInt(width),
                        random.nextInt(height),
                        random.nextInt(width),
                        random.nextInt(height)
                );
            }

            graphics.setFont(
                    new Font("Arial", Font.BOLD, 29)
            );

            for (int i = 0; i < text.length(); i++) {

                graphics.setColor(
                        new Color(
                                random.nextInt(90),
                                random.nextInt(90),
                                random.nextInt(120)
                        )
                );

                graphics.drawString(
                        String.valueOf(text.charAt(i)),
                        18 + (i * 25),
                        43 + random.nextInt(10) - 5
                );
            }

            graphics.dispose();

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            ImageIO.write(image, "png", output);

            return "data:image/png;base64,"
                    + Base64.getEncoder()
                    .encodeToString(output.toByteArray());

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Unable to generate CAPTCHA image.",
                    exception
            );
        }
    }

    // RANDOM VALUES AND HASHING

    private String generateOtp() {

        int value = random.nextInt(1_000_000);

        return String.format(Locale.ROOT, "%06d", value);
    }

    private String generateCaptchaText() {

        String characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < 6; i++) {

            result.append(
                    characters.charAt(
                            random.nextInt(characters.length())
                    )
            );
        }

        return result.toString();
    }

    private String generateResetToken() {

        byte[] bytes = new byte[32];

        random.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String sha256(String value) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    value.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Unable to securely hash value.",
                    exception
            );
        }
    }

    private boolean constantTimeEquals(
            String first,
            String second) {

        if (first == null || second == null) {
            return false;
        }

        return MessageDigest.isEqual(
                first.getBytes(StandardCharsets.UTF_8),
                second.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {

            throw badRequest(
                    "Email address is required."
            );
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    private ResponseStatusException badRequest(String message) {

        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                message
        );
    }

    private ResponseStatusException invalidVerification() {

        return badRequest(
                "Unable to verify your request. Please start again."
        );
    }
}