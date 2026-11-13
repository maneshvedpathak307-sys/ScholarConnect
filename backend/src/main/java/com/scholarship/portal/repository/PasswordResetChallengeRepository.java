package com.scholarship.portal.repository;

import com.scholarship.portal.entity.PasswordResetChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetChallengeRepository
        extends JpaRepository<PasswordResetChallenge, Long> {

    Optional<PasswordResetChallenge> findByEmail(String email);

    Optional<PasswordResetChallenge> findByCaptchaId(String captchaId);

    void deleteByEmail(String email);
}