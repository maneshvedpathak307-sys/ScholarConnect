package com.scholarship.portal.service;

import com.scholarship.portal.dto.ScholarshipReportResponse;
import com.scholarship.portal.entity.Scholarship;
import com.scholarship.portal.entity.ScholarshipApplication;
import com.scholarship.portal.enums.ApplicationStatus;
import com.scholarship.portal.repository.ScholarshipApplicationRepository;
import com.scholarship.portal.repository.ScholarshipRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScholarshipReportService {

    private final ScholarshipRepository scholarships;
    private final ScholarshipApplicationRepository applications;

    @Transactional(readOnly = true)
    public ScholarshipReportResponse generateReport(
            Long scholarshipId,
            LocalDate fromDate,
            LocalDate toDate) {

        // ----------------------------------
        // 1. VALIDATE SCHOLARSHIP ID
        // ----------------------------------

        if (scholarshipId == null) {

            throw new IllegalArgumentException(
                    "Please select a scholarship."
            );
        }

        // ----------------------------------
        // 2. VALIDATE REPORT DATES
        // ----------------------------------

        if (fromDate == null || toDate == null) {

            throw new IllegalArgumentException(
                    "Please select both report dates."
            );
        }

        if (fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    "From date cannot be after the To date."
            );
        }

        // ----------------------------------
        // 3. FIND SCHOLARSHIP
        // ----------------------------------

        Scholarship scholarship = scholarships.findById(scholarshipId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Scholarship not found."
                        )
                );

        // ----------------------------------
        // 4. VALIDATE SCHOLARSHIP PERIOD
        // ----------------------------------

        LocalDate scholarshipStartDate =
                scholarship.getStartDate();

        LocalDate scholarshipEndDate =
                scholarship.getEndDate();

        if (scholarshipStartDate == null
                || scholarshipEndDate == null) {

            throw new IllegalArgumentException(
                    "Scholarship application period is not configured."
            );
        }

        if (scholarshipStartDate.isAfter(scholarshipEndDate)) {

            throw new IllegalArgumentException(
                    "Invalid scholarship application period. "
                            + "Please correct the scholarship start and end dates."
            );
        }

        // From Date cannot be before scholarship start date.
        if (fromDate.isBefore(scholarshipStartDate)) {

            throw new IllegalArgumentException(
                    "Report From Date cannot be before the scholarship "
                            + "start date: "
                            + scholarshipStartDate
            );
        }

        // To Date cannot be after scholarship end date.
        if (toDate.isAfter(scholarshipEndDate)) {

            throw new IllegalArgumentException(
                    "Report To Date cannot be after the scholarship "
                            + "end date: "
                            + scholarshipEndDate
            );
        }

        // Both dates must remain within the scholarship period.
        if (fromDate.isAfter(scholarshipEndDate)
                || toDate.isBefore(scholarshipStartDate)) {

            throw new IllegalArgumentException(
                    "Selected report dates must be within the "
                            + "scholarship application period."
            );
        }

        // ----------------------------------
        // 5. FETCH APPLICATIONS
        // ----------------------------------

        // Include the complete final day.
        List<ScholarshipApplication> records =
                applications
                        .findByScholarship_IdAndSubmittedAtBetweenOrderBySubmittedAtDesc(
                                scholarshipId,
                                fromDate.atStartOfDay(),
                                toDate.atTime(LocalTime.MAX)
                        );

        // ----------------------------------
        // 6. CALCULATE APPLICATION COUNTS
        // ----------------------------------

        long submitted = count(
                records,
                ApplicationStatus.SUBMITTED
        );

        long underReview = count(
                records,
                ApplicationStatus.UNDER_REVIEW
        );

        long correctionRequested = count(
                records,
                ApplicationStatus.CORRECTION_REQUESTED
        );

        long approved = count(
                records,
                ApplicationStatus.APPROVED
        );

        long rejected = count(
                records,
                ApplicationStatus.REJECTED
        );

        // Pending = Submitted + Under Review + Correction Requested.
        long pending =
                submitted + underReview + correctionRequested;

        // ----------------------------------
        // 7. CONVERT APPLICATIONS TO REPORT ROWS
        // ----------------------------------

        List<ScholarshipReportResponse.ApplicationReportRow> rows =
                records.stream()
                        .map(application ->
                                new ScholarshipReportResponse.ApplicationReportRow(
                                        application.getId(),

                                        application.getApplicationNumber(),

                                        application.getStudent() == null
                                                ? "-"
                                                : application.getStudent().getFullName(),

                                        application.getStudent() == null
                                                ? "-"
                                                : application.getStudent().getEmail(),

                                        application.getSubmittedAt(),

                                        application.getStatus() == null
                                                ? "-"
                                                : application.getStatus().name()
                                )
                        )
                        .toList();

        // ----------------------------------
        // 8. RETURN REPORT RESPONSE
        // ----------------------------------

        return new ScholarshipReportResponse(

                scholarship.getId(),

                scholarship.getName(),

                scholarship.getStartDate(),

                scholarship.getEndDate(),

                fromDate,

                toDate,

                records.size(),

                pending,

                approved,

                rejected,

                submitted,

                underReview,

                correctionRequested,

                rows
        );
    }

    // ----------------------------------
    // COUNT APPLICATIONS BY STATUS
    // ----------------------------------

    private long count(
            List<ScholarshipApplication> records,
            ApplicationStatus status) {

        return records.stream()
                .filter(application ->
                        application.getStatus() == status
                )
                .count();
    }
}