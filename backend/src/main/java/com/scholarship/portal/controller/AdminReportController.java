package com.scholarship.portal.controller;

import com.scholarship.portal.dto.ScholarshipReportResponse;
import com.scholarship.portal.service.ScholarshipReportPdfService;
import com.scholarship.portal.service.ScholarshipReportService;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final ScholarshipReportService reportService;

    private final ScholarshipReportPdfService pdfService;

    // ==========================================
    // STEP 1: GET SCHOLARSHIP REPORT DATA
    // ==========================================

    @GetMapping("/scholarships/{scholarshipId}")
    public ResponseEntity<ScholarshipReportResponse> getScholarshipReport(

            @PathVariable("scholarshipId")
            Long scholarshipId,

            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        ScholarshipReportResponse report =
                reportService.generateReport(
                        scholarshipId,
                        from,
                        to
                );

        return ResponseEntity.ok(report);
    }

    // ==========================================
    // STEP 2: DOWNLOAD SCHOLARSHIP REPORT PDF
    // ==========================================

    @GetMapping("/scholarships/{scholarshipId}/pdf")
    public ResponseEntity<byte[]> downloadScholarshipReport(

            @PathVariable("scholarshipId")
            Long scholarshipId,

            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        // Generate report data.
        ScholarshipReportResponse report =
                reportService.generateReport(
                        scholarshipId,
                        from,
                        to
                );

        // Convert report data into PDF.
        byte[] pdf = pdfService.generate(report);

        // Generate filename.
        String filename =
                "ScholarConnect_Report_"
                        + scholarshipId
                        + "_"
                        + from
                        + "_to_"
                        + to
                        + ".pdf";

        // Return downloadable PDF.
        return ResponseEntity.ok()

                .contentType(MediaType.APPLICATION_PDF)

                .contentLength(pdf.length)

                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\""
                )

                // Corrected security header.
                .header(
                        "X-Content-Type-Options",
                        "nosniff"
                )

                .body(pdf);
    }
}