package com.scholarship.portal.controller;

import com.scholarship.portal.dto.UploadedDocumentResponse;
import com.scholarship.portal.dto.UploadedDocumentResponseMapper;
import com.scholarship.portal.entity.User;
import com.scholarship.portal.service.DocumentService;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/documents")
@RequiredArgsConstructor
public class AdminDocumentController {

    private final DocumentService service;
    private final UploadedDocumentResponseMapper mapper;

    @GetMapping("/application/{applicationId}")
    public List<UploadedDocumentResponse> list(
            @PathVariable Long applicationId) {

        return service.forAdmin(applicationId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @PutMapping("/{documentId}/verify")
    public UploadedDocumentResponse verify(
            @AuthenticationPrincipal User admin,
            @PathVariable Long documentId,
            @RequestParam boolean verified,
            @RequestParam(required = false) String remark) {

        return mapper.toResponse(
                service.verify(
                        documentId,
                        admin.getId(),
                        verified,
                        remark
                )
        );
    }

    // ADMIN DOCUMENT PREVIEW / DOWNLOAD

    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long documentId) {

        Resource resource = service.loadForAdmin(documentId);

        // Content type is determined from the stored file extension.
        String filename = resource.getFilename();

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        if (filename != null) {

            String lowerName = filename.toLowerCase();

            if (lowerName.endsWith(".pdf")) {
                mediaType = MediaType.APPLICATION_PDF;
            } else if (lowerName.endsWith(".jpg")
                    || lowerName.endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (lowerName.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\""
                                + (filename == null ? "document" : filename)
                                + "\""
                )
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }
}