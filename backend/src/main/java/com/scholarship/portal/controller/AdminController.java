package com.scholarship.portal.controller;

import com.scholarship.portal.dto.ApplicationResponse;
import com.scholarship.portal.dto.ApplicationResponseMapper;
import com.scholarship.portal.dto.ReviewRequest;
import com.scholarship.portal.entity.User;
import com.scholarship.portal.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService service;
    private final ApplicationResponseMapper mapper;

    @GetMapping("/applications")
    public List<ApplicationResponse> all() {

        return service.all()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return service.stats();
    }

    @PutMapping("/applications/{id}/approve")
    public ApplicationResponse approve(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody ReviewRequest request) {

        return mapper.toResponse(
                service.review(id, admin.getId(),
                        "APPROVE", request.remarks())
        );
    }

    @PutMapping("/applications/{id}/reject")
    public ApplicationResponse reject(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody ReviewRequest request) {

        return mapper.toResponse(
                service.review(id, admin.getId(),
                        "REJECT", request.remarks())
        );
    }

    @PutMapping("/applications/{id}/request-correction")
    public ApplicationResponse correction(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody ReviewRequest request) {

        return mapper.toResponse(
                service.review(id, admin.getId(),
                        "CORRECTION", request.remarks())
        );
    }

    @PutMapping("/applications/{id}/start-review")
    public ApplicationResponse start(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody ReviewRequest request) {

        return mapper.toResponse(
                service.review(id, admin.getId(),
                        "START_REVIEW", request.remarks())
        );
    }
}