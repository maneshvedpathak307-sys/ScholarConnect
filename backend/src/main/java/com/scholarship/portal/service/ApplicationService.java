package com.scholarship.portal.service;

import com.scholarship.portal.dto.ApplicationRequest;
import com.scholarship.portal.entity.*;
import com.scholarship.portal.enums.ApplicationStatus;
import com.scholarship.portal.enums.DocumentType;
import com.scholarship.portal.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ScholarshipApplicationRepository apps;
    private final ScholarshipRepository scholarships;
    private final EducationDetailRepository education;
    private final UserRepository users;
    private final UploadedDocumentRepository documents;

    // =========================================================
    // REQUIRED DOCUMENTS
    // Photograph and Signature are both required.
    // =========================================================

    private static final List<DocumentType> REQUIRED_DOCUMENTS =
            List.of(
                    DocumentType.PHOTOGRAPH,
                    DocumentType.SIGNATURE,
                    DocumentType.AADHAAR,
                    DocumentType.MARKSHEET_10TH,
                    DocumentType.MARKSHEET_12TH,
                    DocumentType.GRADUATION_MARKSHEET,
                    DocumentType.INCOME_CERTIFICATE,
                    DocumentType.BANK_PASSBOOK,
                    DocumentType.CASTE_CERTIFICATE,
                    DocumentType.NON_CREAMY_LAYER,
                    DocumentType.DOMICILE_CERTIFICATE,
                    DocumentType.BONAFIDE_CERTIFICATE
            );

    // =========================================================
    // CREATE OR UPDATE APPLICATION
    // =========================================================

    @Transactional
    public ScholarshipApplication createOrUpdate(
            Long userId,
            Long id,
            ApplicationRequest r) {

        Objects.requireNonNull(
                r,
                "Application request is required"
        );

        ScholarshipApplication a;

        // -----------------------------------------------------
        // CREATE NEW APPLICATION
        // -----------------------------------------------------

        if (id == null) {

            a = new ScholarshipApplication();

            a.setStudent(
                    users.findById(userId)
                            .orElseThrow(() ->
                                    new NoSuchElementException(
                                            "Student not found"
                                    ))
            );

            a.setApplicationNumber(
                    "PGS-" + UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase(Locale.ROOT)
            );

        } else {

            // -------------------------------------------------
            // UPDATE EXISTING APPLICATION
            // -------------------------------------------------

            a = apps.findByIdAndStudentId(id, userId)
                    .orElseThrow(() ->
                            new NoSuchElementException(
                                    "Application not found"
                            ));

            if (a.getStatus() != ApplicationStatus.DRAFT
                    && a.getStatus()
                    != ApplicationStatus.CORRECTION_REQUESTED) {

                throw new IllegalArgumentException(
                        "Only draft or correction-requested applications can be edited."
                );
            }
        }

        // -----------------------------------------------------
        // SCHOLARSHIP INFORMATION
        // -----------------------------------------------------

        if (r.scholarshipId() != null) {

            Scholarship scholarship =
                    scholarships.findById(r.scholarshipId())
                            .orElseThrow(() ->
                                    new NoSuchElementException(
                                            "Scholarship not found"
                                    ));

            a.setScholarship(scholarship);
        }

        // -----------------------------------------------------
        // SCHOLARSHIP REASON
        // -----------------------------------------------------

        if (r.scholarshipReason() != null) {

            a.setScholarshipReason(
                    r.scholarshipReason().trim()
            );
        }

        // -----------------------------------------------------
        // PERSONAL INFORMATION
        // -----------------------------------------------------

        if (r.handicapped() != null) {
            a.setHandicapped(r.handicapped());
        }

        // -----------------------------------------------------
        // FAMILY INFORMATION
        // -----------------------------------------------------

        if (r.fatherName() != null) {
            a.setFatherName(r.fatherName().trim());
        }

        if (r.fatherOccupation() != null) {
            a.setFatherOccupation(r.fatherOccupation());
        }

        if (r.fatherMobileNumber() != null) {
            a.setFatherMobileNumber(r.fatherMobileNumber());
        }

        if (r.motherName() != null) {
            a.setMotherName(r.motherName().trim());
        }

        if (r.motherOccupation() != null) {
            a.setMotherOccupation(r.motherOccupation());
        }

        if (r.motherMobileNumber() != null) {
            a.setMotherMobileNumber(r.motherMobileNumber());
        }

        if (r.annualFamilyIncome() != null) {
            a.setAnnualFamilyIncome(r.annualFamilyIncome());
        }

        // -----------------------------------------------------
        // BANK INFORMATION
        //
        // Empty values do not overwrite previously saved
        // account number and IFSC during correction.
        // -----------------------------------------------------

        if (hasText(r.accountHolderName())) {
            a.setAccountHolderName(
                    r.accountHolderName().trim()
            );
        }

        if (hasText(r.bankName())) {
            a.setBankName(
                    r.bankName().trim()
            );
        }

        if (hasText(r.branchName())) {
            a.setBranchName(
                    r.branchName().trim()
            );
        }

        if (hasText(r.accountNumber())) {
            a.setAccountNumber(
                    r.accountNumber().trim()
            );
        }

        if (hasText(r.ifscCode())) {
            a.setIfscCode(
                    r.ifscCode().trim().toUpperCase(Locale.ROOT)
            );
        }

        // -----------------------------------------------------
        // CURRENT PG EDUCATION INFORMATION
        //
        // These are separate application fields.
        // Do not create a CURRENT_COURSE EducationDetail.
        // -----------------------------------------------------

        if (r.currentCourse() != null) {
            a.setCurrentCourse(
                    r.currentCourse().trim()
            );
        }

        if (r.collegeName() != null) {
            a.setCollegeName(
                    r.collegeName().trim()
            );
        }

        if (r.currentYear() != null) {
            a.setCurrentYear(r.currentYear());
        }

        if (r.academicCategory() != null) {
            a.setAcademicCategory(
                    r.academicCategory().trim()
            );
        }

        // Save application before saving education records.
        a = apps.save(a);

        // -----------------------------------------------------
        // EDUCATION RECORDS
        //
        // Expected records:
        // 10TH
        // 12TH
        // GRADUATION
        //
        // null list = preserve existing records.
        // empty list = remove existing records.
        // -----------------------------------------------------

        if (r.education() != null) {

            List<EducationDetail> existingRecords =
                    education.findByApplicationId(a.getId());

            education.deleteAll(existingRecords);

            for (ApplicationRequest.EducationRequest e
                    : r.education()) {

                if (e.educationLevel() == null
                        || e.educationLevel().isBlank()) {

                    continue;
                }

                EducationDetail d = new EducationDetail();

                d.setApplication(a);

                d.setEducationLevel(
                        e.educationLevel().trim().toUpperCase(Locale.ROOT)
                );

                d.setInstitutionName(
                        e.institutionName()
                );

                d.setBoardOrUniversity(
                        e.boardOrUniversity()
                );

                d.setPassingYear(
                        e.passingYear()
                );

                d.setPercentage(
                        e.percentage()
                );

                d.setCgpa(
                        e.cgpa()
                );

                d.setSeatOrRollNumber(
                        e.seatOrRollNumber()
                );

                education.save(d);
            }
        }

        return a;
    }

    // =========================================================
    // COMMON TEXT VALIDATION
    // =========================================================

    private boolean hasText(String value) {

        return value != null && !value.isBlank();
    }

    // =========================================================
    // GET MY APPLICATIONS
    // =========================================================

    public List<ScholarshipApplication> mine(Long userId) {

        return apps.findByStudentIdOrderByCreatedAtDesc(userId);
    }

    // =========================================================
    // GET SINGLE APPLICATION
    // =========================================================

    public ScholarshipApplication getMine(
            Long id,
            Long userId) {

        return apps.findByIdAndStudentId(id, userId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Application not found"
                        ));
    }

    // =========================================================
    // VALIDATE APPLICATION INFORMATION
    // =========================================================

    private void validateApplicationInformation(
            ScholarshipApplication a) {

        // -----------------------------------------------------
        // SCHOLARSHIP
        // -----------------------------------------------------

        if (a.getScholarship() == null) {

            throw new IllegalArgumentException(
                    "Please select a scholarship."
            );
        }

        // -----------------------------------------------------
        // SCHOLARSHIP REASON
        // -----------------------------------------------------

        if (!hasText(a.getScholarshipReason())) {

            throw new IllegalArgumentException(
                    "Please enter your scholarship reason."
            );
        }

        // -----------------------------------------------------
        // FAMILY INFORMATION
        // -----------------------------------------------------

        if (!hasText(a.getFatherName())) {

            throw new IllegalArgumentException(
                    "Please enter the father or guardian name."
            );
        }

        if (a.getAnnualFamilyIncome() == null
                || a.getAnnualFamilyIncome()
                .compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Please enter a valid annual family income."
            );
        }

        // -----------------------------------------------------
        // BANK INFORMATION
        // -----------------------------------------------------

        if (!hasText(a.getAccountHolderName())
                || !hasText(a.getBankName())
                || !hasText(a.getBranchName())
                || !hasText(a.getAccountNumber())
                || !hasText(a.getIfscCode())) {

            throw new IllegalArgumentException(
                    "Please complete all bank information."
            );
        }

        // -----------------------------------------------------
        // CURRENT PG INFORMATION
        // -----------------------------------------------------

        if (!hasText(a.getCurrentCourse())
                || !hasText(a.getCollegeName())
                || a.getCurrentYear() == null
                || a.getCurrentYear() < 1
                || a.getCurrentYear() > 10
                || !hasText(a.getAcademicCategory())) {

            throw new IllegalArgumentException(
                    "Please complete your current PG course, college, year/semester and academic category."
            );
        }

        // -----------------------------------------------------
        // EDUCATION RECORDS
        //
        // Only 10TH, 12TH and GRADUATION are required.
        // CURRENT_COURSE is NOT required here.
        // -----------------------------------------------------

        List<EducationDetail> records =
                education.findByApplicationId(a.getId());

        boolean has10th = records.stream().anyMatch(e ->

                "10TH".equalsIgnoreCase(e.getEducationLevel())
                        && hasText(e.getInstitutionName())
                        && e.getPassingYear() != null
        );

        boolean has12th = records.stream().anyMatch(e ->

                "12TH".equalsIgnoreCase(e.getEducationLevel())
                        && hasText(e.getInstitutionName())
                        && e.getPassingYear() != null
        );

        boolean hasGraduation = records.stream().anyMatch(e ->

                "GRADUATION".equalsIgnoreCase(e.getEducationLevel())
                        && hasText(e.getInstitutionName())
                        && e.getPassingYear() != null
        );

        if (!has10th) {

            throw new IllegalArgumentException(
                    "Please provide complete 10th education details."
            );
        }

        if (!has12th) {

            throw new IllegalArgumentException(
                    "Please provide complete 12th education details."
            );
        }

        if (!hasGraduation) {

            throw new IllegalArgumentException(
                    "Please provide complete graduation education details."
            );
        }
    }

    // =========================================================
    // VALIDATE REQUIRED DOCUMENT UPLOADS
    //
    // Admin verification is not required before submission.
    // The latest document must exist and must not be rejected.
    // =========================================================

    private void validateRequiredDocuments(Long applicationId) {

        List<String> missing = new ArrayList<>();

        for (DocumentType type : REQUIRED_DOCUMENTS) {

            Optional<UploadedDocument> optional =
                    documents
                            .findFirstByApplicationIdAndDocumentTypeOrderByUploadedAtDescIdDesc(
                                    applicationId,
                                    type
                            );

            if (optional.isEmpty()) {

                missing.add(type.name());

                continue;
            }

            UploadedDocument latestDocument = optional.get();

            boolean rejected =
                    latestDocument.getReviewedAt() != null
                            && !latestDocument.isVerified();

            if (rejected) {

                missing.add(
                        type.name() + " (replacement required)"
                );
            }
        }

        if (!missing.isEmpty()) {

            throw new IllegalArgumentException(
                    "Please upload or replace these required documents: "
                            + String.join(", ", missing)
            );
        }
    }

    // =========================================================
    // SUBMIT APPLICATION
    // =========================================================

    @Transactional
    public ScholarshipApplication submit(
            Long id,
            Long userId) {

        ScholarshipApplication a = getMine(id, userId);

        if (a.getStatus() != ApplicationStatus.DRAFT
                && a.getStatus()
                != ApplicationStatus.CORRECTION_REQUESTED) {

            throw new IllegalArgumentException(
                    "Application cannot be submitted in its current status."
            );
        }

        // Validate application fields and education records.
        validateApplicationInformation(a);

        // Validate all required document uploads.
        // Admin verification can happen after submission.
        validateRequiredDocuments(id);

        a.setStatus(ApplicationStatus.SUBMITTED);

        a.setSubmittedAt(LocalDateTime.now());

        return apps.save(a);
    }
}