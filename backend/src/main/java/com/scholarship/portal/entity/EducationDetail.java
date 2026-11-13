package com.scholarship.portal.entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "education_details")
@Getter
@Setter
@NoArgsConstructor
public class EducationDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "application_id")
    private ScholarshipApplication application;

    @Column(nullable = false, length = 40)
    private String educationLevel;

    @Column(length = 200)
    private String institutionName;

    @Column(length = 200)
    private String boardOrUniversity;

    private Integer passingYear;

    private Double percentage;

    private Double cgpa;

    @Column(length = 100)
    private String seatOrRollNumber;
}