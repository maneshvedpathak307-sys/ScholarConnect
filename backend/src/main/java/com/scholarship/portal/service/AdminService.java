package com.scholarship.portal.service;

import com.scholarship.portal.entity.*;
import com.scholarship.portal.enums.ApplicationStatus;
import com.scholarship.portal.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ScholarshipApplicationRepository apps;
    private final ApplicationReviewRepository reviews;
    private final UserRepository users;
    private final NotificationRepository notifications;

    // GET ALL APPLICATIONS
    @Transactional(readOnly = true)
    public List<ScholarshipApplication> all() {
        return apps.findAll();
    }

    // APPLICATION REVIEW
    @Transactional
    public ScholarshipApplication review(
            Long id,
            Long adminId,
            String action,
            String remarks) {

        // Find application
        ScholarshipApplication application =
                apps.findById(id)
                        .orElseThrow(() ->
                                new NoSuchElementException(
                                        "Application not found."
                                ));

        // Validate remarks
        if (remarks == null || remarks.isBlank()) {
            throw new IllegalArgumentException(
                    "Review remarks are required."
            );
        }

        ApplicationStatus currentStatus =
                application.getStatus();

        ApplicationStatus newStatus;

        /*
         * IMPORTANT:
         * A student submits an application with SUBMITTED status.
         *
         * Admin can now directly approve, reject or request
         * correction from SUBMITTED or UNDER_REVIEW status.
         */

        switch (action) {

            case "START_REVIEW":

                if (currentStatus != ApplicationStatus.SUBMITTED) {
                    throw new IllegalArgumentException(
                            "Only submitted applications can start review."
                    );
                }

                newStatus = ApplicationStatus.UNDER_REVIEW;
                break;

            case "APPROVE":

                if (!isReviewable(currentStatus)) {
                    throw new IllegalArgumentException(
                            "Only submitted or under-review applications can be approved. Current status: "
                                    + currentStatus
                    );
                }

                newStatus = ApplicationStatus.APPROVED;
                break;

            case "REJECT":

                if (!isReviewable(currentStatus)) {
                    throw new IllegalArgumentException(
                            "Only submitted or under-review applications can be rejected. Current status: "
                                    + currentStatus
                    );
                }

                newStatus = ApplicationStatus.REJECTED;
                break;

            case "CORRECTION":

                if (!isReviewable(currentStatus)) {
                    throw new IllegalArgumentException(
                            "Only submitted or under-review applications can request correction. Current status: "
                                    + currentStatus
                    );
                }

                newStatus = ApplicationStatus.CORRECTION_REQUESTED;
                break;

            default:

                throw new IllegalArgumentException(
                        "Unknown review action: " + action
                );
        }

        // Find logged-in admin
        User admin = users.findById(adminId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Admin account not found."
                        ));

        // Update application status
        application.setStatus(newStatus);

        // Save review history
        ApplicationReview review = new ApplicationReview();

        review.setApplication(application);
        review.setAdmin(admin);
        review.setAction(action);
        review.setRemarks(remarks.trim());

        reviews.save(review);

        // Create student notification
        Notification notification = new Notification();

        notification.setUser(application.getStudent());

        String notificationMessage =
                "Your application "
                        + application.getApplicationNumber()
                        + " status is now "
                        + newStatus
                        + ". Remarks: "
                        + remarks.trim();

        // Notification column supports maximum 500 characters
        if (notificationMessage.length() > 500) {
            notificationMessage =
                    notificationMessage.substring(0, 497) + "...";
        }

        notification.setMessage(notificationMessage);

        notifications.save(notification);

        // Save updated application
        return apps.save(application);
    }

    // CHECK WHETHER APPLICATION CAN BE REVIEWED
    private boolean isReviewable(ApplicationStatus status) {

        return status == ApplicationStatus.SUBMITTED
                || status == ApplicationStatus.UNDER_REVIEW;
    }

    // ADMIN DASHBOARD STATISTICS
    @Transactional(readOnly = true)
    public Map<String, Long> stats() {

        Map<String, Long> statistics =
                new LinkedHashMap<>();

        long total = apps.count();

        long approved =
                apps.countByStatus(ApplicationStatus.APPROVED);

        long submitted =
                apps.countByStatus(ApplicationStatus.SUBMITTED);

        long underReview =
                apps.countByStatus(ApplicationStatus.UNDER_REVIEW);

        long correction =
                apps.countByStatus(
                        ApplicationStatus.CORRECTION_REQUESTED
                );

        long pending =
                submitted + underReview + correction;

        long approvalRate = total == 0
                ? 0
                : Math.round((approved * 100.0) / total);

        // Individual status counts
        for (ApplicationStatus status : ApplicationStatus.values()) {

            statistics.put(
                    status.name(),
                    apps.countByStatus(status)
            );
        }

        // Additional dashboard statistics
        statistics.put("TOTAL", total);
        statistics.put("PENDING", pending);
        statistics.put("APPROVAL_RATE", approvalRate);

        return statistics;
    }
}