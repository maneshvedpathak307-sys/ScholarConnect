package com.scholarship.portal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ApplicationResponse(

        Long id,
        String applicationNumber,

        StudentSummary student,
        ScholarshipSummary scholarship,

        String status,
        String scholarshipReason,
        Boolean handicapped,

        // Family Information
        String fatherName,
        String fatherOccupation,
        String fatherMobileNumber,

        String motherName,
        String motherOccupation,
        String motherMobileNumber,

        BigDecimal annualFamilyIncome,

        // Bank Information
        String accountHolderName,
        String bankName,
        String branchName,
        String maskedAccountNumber,
        String ifscCode,

        // Current Education Information
        String currentCourse,
        String collegeName,
        Integer currentYear,
        String academicCategory,

        // Timestamps
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime submittedAt,

        // Education Records
        List<EducationResponse> education,

        // Latest Admin Review Remark
        String latestReviewRemarks

) {

    public record StudentSummary(
            Long id,
            String fullName,
            String email,
            String mobileNumber,
            LocalDate dateOfBirth,
            String gender
    ) {}

    public record ScholarshipSummary(
            Long id,
            String name,
            String educationLevel,
            String eligibleCategory,
            String eligibleCourse,
            BigDecimal awardAmount,
            LocalDate startDate,
            LocalDate endDate
    ) {}

    public record EducationResponse(
            Long id,
            String educationLevel,
            String institutionName,
            String boardOrUniversity,
            Integer passingYear,
            Double percentage,
            Double cgpa,
            String seatOrRollNumber
    ) {}
}