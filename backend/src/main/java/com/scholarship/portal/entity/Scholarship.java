package com.scholarship.portal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "scholarships")
@Getter
@Setter
@NoArgsConstructor
public class Scholarship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    // UG or PG
    @Column(name = "education_level", nullable = false, length = 10)
    private String educationLevel = "PG";

    // OPEN, EWS, OBC, SC, ST, VJNT / NT, SBC, MINORITY
    private String eligibleCategory;

    // Example: ALL_ELIGIBLE_UG_COURSES
    private String eligibleCourse;

    private BigDecimal maximumFamilyIncome;

    private BigDecimal awardAmount;

    private LocalDate startDate;

    private LocalDate endDate;

    private boolean active = true;
}