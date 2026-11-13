package com.scholarship.portal.dto;

import com.scholarship.portal.enums.DocumentType;

import java.time.LocalDateTime;

public record DocumentChecklistItem(
        DocumentType documentType,
        boolean required,
        boolean uploaded,
        String status,
        Long documentId,
        String originalFileName,
        String verificationRemark,
        LocalDateTime uploadedAt
) {
}