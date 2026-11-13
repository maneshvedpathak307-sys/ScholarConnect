package com.scholarship.portal.controller;

import com.scholarship.portal.dto.ApplicationRequest;
import com.scholarship.portal.dto.ApplicationResponse;
import com.scholarship.portal.dto.ApplicationResponseMapper;
import com.scholarship.portal.entity.User;
import com.scholarship.portal.service.ApplicationService;
import com.scholarship.portal.service.ApplicationPdfService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService service;
    private final ApplicationResponseMapper mapper;
    private final ApplicationPdfService pdfService;

    // CREATE APPLICATION
    @PostMapping
    public ResponseEntity<ApplicationResponse> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ApplicationRequest request) {

        var application = service.createOrUpdate(
                user.getId(),
                null,
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toResponse(application));
    }

    // UPDATE APPLICATION
    @PutMapping("/{id}")
    public ApplicationResponse update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ApplicationRequest request) {

        return mapper.toResponse(
                service.createOrUpdate(
                        user.getId(),
                        id,
                        request
                )
        );
    }

    // GET MY APPLICATIONS
    @GetMapping("/my")
    public List<ApplicationResponse> mine(
            @AuthenticationPrincipal User user) {

        return service.mine(user.getId())
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    // GET SINGLE APPLICATION
    @GetMapping("/{id}")
    public ApplicationResponse get(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        return mapper.toResponse(
                service.getMine(id, user.getId())
        );
    }

    // SUBMIT APPLICATION
    @PostMapping("/{id}/submit")
    public ApplicationResponse submit(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        return mapper.toResponse(
                service.submit(id, user.getId())
        );
    }

    // DOWNLOAD APPLICATION PDF
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        // Verify application ownership.
        var application = service.getMine(
                id,
                user.getId()
        );

        // Convert application to response DTO.
        ApplicationResponse response =
                mapper.toResponse(application);

        // Generate PDF.
        byte[] pdf = pdfService.generate(response);

        if (pdf == null || pdf.length == 0) {
            throw new IllegalStateException(
                    "Generated application PDF is empty."
            );
        }

        // Generate filename.
        String filename =
                application.getApplicationNumber() + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\""
                )
                .header(
                        "X-Content-Type-Options",
                        "nosniff"
                )
                .body(pdf);
    }
}