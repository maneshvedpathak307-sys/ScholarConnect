package com.scholarship.portal.dto;

import com.scholarship.portal.entity.UploadedDocument;
import org.springframework.stereotype.Component;

@Component
public class UploadedDocumentResponseMapper {

    public UploadedDocumentResponse toResponse(
            UploadedDocument document) {

        return new UploadedDocumentResponse(
                document.getId(),
                document.getApplication().getId(),
                document.getApplication().getApplicationNumber(),
                document.getDocumentType(),
                document.getOriginalFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.isVerified(),
                document.getVerificationRemark(),

                document.getReviewedBy() != null
                        ? document.getReviewedBy().getId()
                        : null,

                document.getReviewedBy() != null
                        ? document.getReviewedBy().getFullName()
                        : null,

                document.getReviewedAt(),
                document.getUploadedAt()
        );
    }
}