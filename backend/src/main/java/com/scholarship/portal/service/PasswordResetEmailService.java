package com.scholarship.portal.service;

import lombok.RequiredArgsConstructor;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordResetEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendOtp(String recipient, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(recipient);
        message.setSubject("ScholarConnect - Password Reset OTP");

        message.setText(
                "Hello,\n\n"
                + "We received a request to reset your ScholarConnect password.\n\n"
                + "Your verification OTP is: " + otp + "\n\n"
                + "This OTP expires in 5 minutes.\n"
                + "Do not share this OTP with anyone.\n\n"
                + "If you did not request this password reset, "
                + "you can safely ignore this email.\n\n"
                + "Regards,\n"
                + "ScholarConnect Support"
        );

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            throw new IllegalStateException(
                    "Unable to send OTP email. Check Gmail SMTP configuration.",
                    exception
            );
        }
    }
}