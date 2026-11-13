package com.scholarship.portal.dto;

import com.scholarship.portal.entity.EducationDetail;
import com.scholarship.portal.entity.ScholarshipApplication;
import com.scholarship.portal.repository.ApplicationReviewRepository;
import com.scholarship.portal.repository.EducationDetailRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ApplicationResponseMapper {

    private final EducationDetailRepository educationRepository;
    private final ApplicationReviewRepository reviewRepository;

    public ApplicationResponse toResponse(ScholarshipApplication a) {

        // STUDENT INFORMATION

        var student = a.getStudent();

        var studentSummary =
                new ApplicationResponse.StudentSummary(
                        student.getId(),
                        student.getFullName(),
                        student.getEmail(),
                        student.getMobileNumber(),
                        student.getDateOfBirth(),
                        student.getGender()
                );

        // SCHOLARSHIP INFORMATION

        ApplicationResponse.ScholarshipSummary scholarshipSummary = null;

        if (a.getScholarship() != null) {

            var s = a.getScholarship();

            scholarshipSummary =
                    new ApplicationResponse.ScholarshipSummary(
                            s.getId(),
                            s.getName(),
                            s.getEducationLevel(),
                            s.getEligibleCategory(),
                            s.getEligibleCourse(),
                            s.getAwardAmount(),
                            s.getStartDate(),
                            s.getEndDate()
                    );
        }

        // EDUCATION RECORDS

        List<ApplicationResponse.EducationResponse> education =
                educationRepository.findByApplicationId(a.getId())
                        .stream()
                        .map(this::toEducationResponse)
                        .toList();

        // LATEST ADMIN REVIEW REMARK

        String latestReviewRemarks =
                reviewRepository
                        .findFirstByApplicationIdOrderByReviewedAtDescIdDesc(
                                a.getId()
                        )
                        .map(review -> review.getRemarks())
                        .orElse(null);

        // BUILD RESPONSE

        return new ApplicationResponse(

                a.getId(),
                a.getApplicationNumber(),

                studentSummary,
                scholarshipSummary,

                a.getStatus().name(),
                a.getScholarshipReason(),
                a.getHandicapped(),

                a.getFatherName(),
                a.getFatherOccupation(),
                a.getFatherMobileNumber(),

                a.getMotherName(),
                a.getMotherOccupation(),
                a.getMotherMobileNumber(),

                a.getAnnualFamilyIncome(),

                a.getAccountHolderName(),
                a.getBankName(),
                a.getBranchName(),
                maskAccountNumber(a.getAccountNumber()),
                a.getIfscCode(),

                a.getCurrentCourse(),
                a.getCollegeName(),
                a.getCurrentYear(),
                a.getAcademicCategory(),

                a.getCreatedAt(),
                a.getUpdatedAt(),
                a.getSubmittedAt(),

                education,

                latestReviewRemarks
        );
    }

    private ApplicationResponse.EducationResponse toEducationResponse(
            EducationDetail e) {

        return new ApplicationResponse.EducationResponse(
                e.getId(),
                e.getEducationLevel(),
                e.getInstitutionName(),
                e.getBoardOrUniversity(),
                e.getPassingYear(),
                e.getPercentage(),
                e.getCgpa(),
                e.getSeatOrRollNumber()
        );
    }

    private String maskAccountNumber(String accountNumber) {

        if (accountNumber == null || accountNumber.isBlank()) {
            return null;
        }

        int visibleDigits = Math.min(4, accountNumber.length());

        return "*".repeat(accountNumber.length() - visibleDigits)
                + accountNumber.substring(
                        accountNumber.length() - visibleDigits
                );
    }
}