package com.scholarship.portal.controller;

import com.scholarship.portal.dto.ApplicationResponse;
import com.scholarship.portal.dto.ApplicationResponseMapper;
import com.scholarship.portal.repository.ScholarshipApplicationRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/admin/applications")
@RequiredArgsConstructor
public class AdminApplicationDetailController {

    private final ScholarshipApplicationRepository repository;
    private final ApplicationResponseMapper mapper;

    @GetMapping("/{id}")
    public ApplicationResponse get(@PathVariable Long id) {

        var application = repository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Application not found"));

        return mapper.toResponse(application);
    }
}