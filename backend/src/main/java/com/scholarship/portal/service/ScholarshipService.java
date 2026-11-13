package com.scholarship.portal.service;

import com.scholarship.portal.dto.ScholarshipRequest;
import com.scholarship.portal.entity.Scholarship;
import com.scholarship.portal.repository.ScholarshipRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ScholarshipService {

    private final ScholarshipRepository repo;

    // Get active scholarships for students.
    public List<Scholarship> active() {
        return repo.findByActiveTrue();
    }

    // Get all scholarships for admin.
    public List<Scholarship> all() {
        return repo.findAll();
    }

    // Create scholarship.
    @Transactional
    public Scholarship create(ScholarshipRequest request) {

        Scholarship scholarship = new Scholarship();

        apply(scholarship, request);

        return repo.save(scholarship);
    }

    // Update scholarship.
    @Transactional
    public Scholarship update(
            Long id,
            ScholarshipRequest request) {

        Scholarship scholarship =
                repo.findById(id)
                        .orElseThrow(() ->
                                new NoSuchElementException(
                                        "Scholarship not found"
                                )
                        );

        apply(scholarship, request);

        return repo.save(scholarship);
    }

    // Apply request values.
    private void apply(
            Scholarship scholarship,
            ScholarshipRequest request) {

        String level = request.educationLevel()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!level.equals("UG") && !level.equals("PG")) {
            throw new IllegalArgumentException(
                    "Education level must be UG or PG."
            );
        }

        if (request.startDate() != null
                && request.endDate() != null
                && request.endDate().isBefore(request.startDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date."
            );
        }

        if (request.awardAmount() != null
                && request.awardAmount().signum() < 0) {

            throw new IllegalArgumentException(
                    "Award amount cannot be negative."
            );
        }

        if (request.maximumFamilyIncome() != null
                && request.maximumFamilyIncome().signum() < 0) {

            throw new IllegalArgumentException(
                    "Maximum family income cannot be negative."
            );
        }

        scholarship.setName(request.name().trim());

        scholarship.setDescription(
                request.description()
        );

        scholarship.setEducationLevel(level);

        scholarship.setEligibleCategory(
                request.eligibleCategory().trim()
        );

        scholarship.setEligibleCourse(
                request.eligibleCourse()
        );

        scholarship.setMaximumFamilyIncome(
                request.maximumFamilyIncome()
        );

        scholarship.setAwardAmount(
                request.awardAmount()
        );

        scholarship.setStartDate(
                request.startDate()
        );

        scholarship.setEndDate(
                request.endDate()
        );

        if (request.active() != null) {
            scholarship.setActive(request.active());
        }
    }
}