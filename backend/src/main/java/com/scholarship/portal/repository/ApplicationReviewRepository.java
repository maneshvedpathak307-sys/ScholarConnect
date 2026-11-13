package com.scholarship.portal.repository;

import com.scholarship.portal.entity.ApplicationReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationReviewRepository
        extends JpaRepository<ApplicationReview, Long> {

    List<ApplicationReview> findByApplicationIdOrderByReviewedAtDesc(
            Long applicationId
    );

    Optional<ApplicationReview>
    findFirstByApplicationIdOrderByReviewedAtDescIdDesc(
            Long applicationId
    );
}