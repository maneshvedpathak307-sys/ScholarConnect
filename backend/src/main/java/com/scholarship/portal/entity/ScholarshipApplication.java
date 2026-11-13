package com.scholarship.portal.entity;

import com.scholarship.portal.enums.ApplicationStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "scholarship_applications")
@Getter
@Setter
@NoArgsConstructor
public class ScholarshipApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String applicationNumber;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "scholarship_id")
    private Scholarship scholarship;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @Column(length = 2000)
    private String scholarshipReason;
    
    @Column(nullable = false)
    private Boolean handicapped = false;

    // Family Information
    private String fatherName;

    private String fatherOccupation;

    private String fatherMobileNumber;

    private String motherName;

    private String motherOccupation;

    private String motherMobileNumber;

    private BigDecimal annualFamilyIncome;

    // Bank Information
    private String accountHolderName;

    private String bankName;

    private String branchName;

    @JsonIgnore
    private String accountNumber;

    @JsonIgnore
    private String ifscCode;

    // Current Education Information
    private String currentCourse;

    private String collegeName;

    private Integer currentYear;

    private String academicCategory;

    // Application timestamps
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime submittedAt;

    @PreUpdate
    public void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }
}