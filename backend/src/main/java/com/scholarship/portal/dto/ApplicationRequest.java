package com.scholarship.portal.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record ApplicationRequest(

        Long scholarshipId,

        @Size(max = 2000)
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
        String accountNumber,
        String ifscCode,

        // Current Education
        String currentCourse,
        String collegeName,
        Integer currentYear,
        String academicCategory,

        // Multiple Education Records
        @Valid
        List<EducationRequest> education

) {

    public record EducationRequest(

            @NotBlank
            String educationLevel,

            String institutionName,

            String boardOrUniversity,

            Integer passingYear,

            Double percentage,

            Double cgpa,

            String seatOrRollNumber

    ) {}
}