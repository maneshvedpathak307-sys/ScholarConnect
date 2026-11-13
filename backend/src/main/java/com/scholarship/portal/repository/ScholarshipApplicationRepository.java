package com.scholarship.portal.repository;

import com.scholarship.portal.entity.ScholarshipApplication;
import com.scholarship.portal.enums.ApplicationStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ScholarshipApplicationRepository
        extends JpaRepository<ScholarshipApplication, Long> {

    List<ScholarshipApplication>
    findByStudentIdOrderByCreatedAtDesc(Long studentId);

    Optional<ScholarshipApplication>
    findByIdAndStudentId(Long id, Long studentId);

    long countByStatus(ApplicationStatus status);

    // Applications submitted for one scholarship in a date range.
    List<ScholarshipApplication>
    findByScholarship_IdAndSubmittedAtBetweenOrderBySubmittedAtDesc(
            Long scholarshipId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}