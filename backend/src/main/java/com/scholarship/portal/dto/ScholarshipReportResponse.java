package com.scholarship.portal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ScholarshipReportResponse(

        Long scholarshipId,
        String scholarshipName,

        LocalDate scholarshipStartDate,
        LocalDate scholarshipEndDate,

        LocalDate reportFromDate,
        LocalDate reportToDate,

        long totalApplications,
        long pendingApplications,
        long approvedApplications,
        long rejectedApplications,

        long submittedApplications,
        long underReviewApplications,
        long correctionRequestedApplications,

        List<ApplicationReportRow> applications

) {

    public record ApplicationReportRow(

            Long applicationId,
            String applicationNumber,
            String studentName,
            String studentEmail,
            LocalDateTime applicationDate,
            String status

    ) {}
}