package com.scholarship.portal.dto;

import com.scholarship.portal.enums.DocumentType;
import java.time.LocalDateTime;

public record UploadedDocumentResponse(
        Long id,
        Long applicationId,
        String applicationNumber,
        DocumentType documentType,
        String originalFileName,
        String contentType,
        long fileSize,
        boolean verified,
        String verificationRemark,
        Long reviewedById,
        String reviewedByName,
        LocalDateTime reviewedAt,
        LocalDateTime uploadedAt
) {
}