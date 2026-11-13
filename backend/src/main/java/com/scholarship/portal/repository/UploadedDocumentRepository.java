package com.scholarship.portal.repository;

import com.scholarship.portal.entity.UploadedDocument;
import com.scholarship.portal.enums.DocumentType;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UploadedDocumentRepository
        extends JpaRepository<UploadedDocument, Long> {

    List<UploadedDocument> findByApplicationId(Long applicationId);

    Optional<UploadedDocument>
    findFirstByApplicationIdAndDocumentTypeOrderByUploadedAtDescIdDesc(
            Long applicationId,
            DocumentType documentType
    );
}