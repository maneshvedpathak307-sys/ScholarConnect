package com.scholarship.portal.controller;

import com.scholarship.portal.dto.UploadedDocumentResponse;
import com.scholarship.portal.dto.UploadedDocumentResponseMapper;
import com.scholarship.portal.entity.User;
import com.scholarship.portal.enums.DocumentType;
import com.scholarship.portal.service.DocumentService;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import com.scholarship.portal.dto.DocumentChecklistItem;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService service;
    private final UploadedDocumentResponseMapper mapper;

    @PostMapping(
        value = "/upload/{applicationId}",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<UploadedDocumentResponse> upload(
            @AuthenticationPrincipal User user,
            @PathVariable Long applicationId,
            @RequestParam DocumentType documentType,
            @RequestParam MultipartFile file) {

        UploadedDocumentResponse response = mapper.toResponse(
                service.upload(
                        applicationId,
                        user.getId(),
                        documentType,
                        file
                )
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/application/{applicationId}")
    public List<UploadedDocumentResponse> list(
            @AuthenticationPrincipal User user,
            @PathVariable Long applicationId) {

        return service.mine(applicationId, user.getId())
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> download(
            @AuthenticationPrincipal User user,
            @PathVariable Long documentId) {

        Resource resource = service.load(
                documentId,
                user.getId()
        );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\""
                                + resource.getFilename() + "\""
                )
                .body(resource);
    }
    
    @GetMapping("/application/{applicationId}/checklist")
    public List<DocumentChecklistItem> checklist(
            @AuthenticationPrincipal User user,
            @PathVariable Long applicationId) {

        return service.checklist(applicationId, user.getId());
    }
}