package com.scholarship.portal.service;

import com.scholarship.portal.dto.DocumentChecklistItem;
import com.scholarship.portal.entity.*;
import com.scholarship.portal.enums.*;
import com.scholarship.portal.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final UploadedDocumentRepository docs;
    private final ScholarshipApplicationRepository apps;
    private final UserRepository users;

    @Value("${app.upload-dir}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    // REQUIRED DOCUMENTS
    // Photograph and Signature accept JPG/JPEG/PNG only.
    // All other required documents accept PDF only.

    private static final List<DocumentType> REQUIRED_DOCUMENTS =
            List.of(
                    DocumentType.PHOTOGRAPH,
                    DocumentType.SIGNATURE,
                    DocumentType.AADHAAR,
                    DocumentType.MARKSHEET_10TH,
                    DocumentType.MARKSHEET_12TH,
                    DocumentType.GRADUATION_MARKSHEET,
                    DocumentType.INCOME_CERTIFICATE,
                    DocumentType.BANK_PASSBOOK,
                    DocumentType.CASTE_CERTIFICATE,
                    DocumentType.NON_CREAMY_LAYER,
                    DocumentType.DOMICILE_CERTIFICATE,
                    DocumentType.BONAFIDE_CERTIFICATE
            );

    // OPTIONAL DOCUMENTS

    private static final List<DocumentType> OPTIONAL_DOCUMENTS =
            List.of(
                    DocumentType.PREVIOUS_YEAR_MARKSHEET,
                    DocumentType.CASTE_VALIDITY,
                    DocumentType.PAN,
                    DocumentType.RATION_CARD,
                    DocumentType.OTHER
            );

    // ALL ALLOWED DOCUMENTS

    private static final List<DocumentType> CHECKLIST_DOCUMENTS;

    static {
        List<DocumentType> all = new ArrayList<>();

        all.addAll(REQUIRED_DOCUMENTS);
        all.addAll(OPTIONAL_DOCUMENTS);

        CHECKLIST_DOCUMENTS = Collections.unmodifiableList(all);
    }

    // =========================================================
    // UPLOAD DOCUMENT
    // =========================================================

    @Transactional
    public UploadedDocument upload(
            Long appId,
            Long userId,
            DocumentType type,
            MultipartFile file) {

        // Verify application ownership.

        ScholarshipApplication application =
                apps.findByIdAndStudentId(appId, userId)
                        .orElseThrow(() ->
                                new NoSuchElementException(
                                        "Application not found"
                                ));

        // Documents can only be uploaded in draft or correction mode.

        if (application.getStatus() != ApplicationStatus.DRAFT
                && application.getStatus()
                != ApplicationStatus.CORRECTION_REQUESTED) {

            throw new IllegalArgumentException(
                    "Documents can only be uploaded for draft or correction-requested applications."
            );
        }

        // Validate document type.

        if (type == null || !CHECKLIST_DOCUMENTS.contains(type)) {
            throw new IllegalArgumentException(
                    "This document type is not allowed."
            );
        }

        // Validate file.

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a file."
            );
        }

        // Maximum file size: 5 MB.

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Maximum file size is 5 MB."
            );
        }

        String originalName = safeOriginalFileName(
                file.getOriginalFilename()
        );

        String originalExtension = getExtension(originalName);

        byte[] fileBytes;

        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Could not read uploaded file."
            );
        }

        // Detect actual file type using file signature.

        String detectedContentType = detectContentType(fileBytes);

        if (detectedContentType == null) {
            throw new IllegalArgumentException(
                    "Invalid file. Only genuine PDF, JPG and PNG files are allowed."
            );
        }

        // Validate format according to document type.

        validateDocumentFormat(
                type,
                detectedContentType,
                originalExtension
        );

        String expectedExtension = extensionFor(detectedContentType);

        // Create private storage directory.

        Path root = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        // Generate random storage filename.

        String storedFileName = UUID.randomUUID()
                + expectedExtension;

        Path destination = root.resolve(storedFileName)
                .normalize();

        // Prevent path traversal.

        if (!destination.startsWith(root)) {
            throw new IllegalArgumentException(
                    "Invalid file path."
            );
        }

        try {

            Files.createDirectories(root);

            Files.write(
                    destination,
                    fileBytes,
                    StandardOpenOption.CREATE_NEW,
                    StandardOpenOption.WRITE
            );

            UploadedDocument document = new UploadedDocument();

            document.setApplication(application);
            document.setDocumentType(type);
            document.setOriginalFileName(originalName);
            document.setStoredFileName(storedFileName);
            document.setContentType(detectedContentType);
            document.setFileSize(fileBytes.length);
            document.setUploadedAt(LocalDateTime.now());

            // Save document metadata in database.

            try {
                return docs.save(document);

            } catch (RuntimeException e) {

                // Remove physical file if database saving fails.

                Files.deleteIfExists(destination);

                throw e;
            }

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Could not save uploaded file."
            );
        }
    }

    // =========================================================
    // DOCUMENT-SPECIFIC FORMAT VALIDATION
    // =========================================================

    private void validateDocumentFormat(
            DocumentType type,
            String detectedContentType,
            String originalExtension) {

        // Photograph AND Signature are image documents.

        boolean isImageDocument =
                type == DocumentType.PHOTOGRAPH
                || type == DocumentType.SIGNATURE;

        if (isImageDocument) {

            // Photograph and Signature accept JPEG/JPG or PNG only.

            if (!detectedContentType.equals("image/jpeg")
                    && !detectedContentType.equals("image/png")) {

                throw new IllegalArgumentException(
                        "Photograph and Signature must be JPG, JPEG or PNG images. PDF is not allowed."
                );
            }

            boolean validImageExtension =
                    originalExtension.equals(".jpg")
                    || originalExtension.equals(".jpeg")
                    || originalExtension.equals(".png");

            if (!validImageExtension) {

                throw new IllegalArgumentException(
                        "Photograph and Signature filenames must have a JPG, JPEG or PNG extension."
                );
            }

            // Ensure filename extension matches actual image format.

            boolean extensionMatches =
                    (detectedContentType.equals("image/jpeg")
                            && (originalExtension.equals(".jpg")
                                || originalExtension.equals(".jpeg")))
                    || (detectedContentType.equals("image/png")
                            && originalExtension.equals(".png"));

            if (!extensionMatches) {

                throw new IllegalArgumentException(
                        "Image file extension does not match its actual image format."
                );
            }

        } else {

            // Every other document accepts PDF only.

            if (!detectedContentType.equals("application/pdf")) {

                throw new IllegalArgumentException(
                        "All documents except Photograph and Signature must be uploaded as PDF files only."
                );
            }

            if (!originalExtension.equals(".pdf")) {

                throw new IllegalArgumentException(
                        "Please upload this document with a .pdf extension."
                );
            }
        }
    }

    // =========================================================
    // DETECT FILE TYPE USING FILE SIGNATURE
    // =========================================================

    private String detectContentType(byte[] bytes) {

        if (bytes == null || bytes.length < 4) {
            return null;
        }

        // PDF signature: %PDF-

        if (bytes.length >= 5
                && bytes[0] == 0x25
                && bytes[1] == 0x50
                && bytes[2] == 0x44
                && bytes[3] == 0x46
                && bytes[4] == 0x2D) {

            return "application/pdf";
        }

        // JPEG signature: FF D8 FF

        if (bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF) {

            return "image/jpeg";
        }

        // PNG signature: 89 50 4E 47 0D 0A 1A 0A

        byte[] pngSignature = {
                (byte) 0x89,
                0x50,
                0x4E,
                0x47,
                0x0D,
                0x0A,
                0x1A,
                0x0A
        };

        if (bytes.length >= pngSignature.length) {

            boolean matches = true;

            for (int i = 0; i < pngSignature.length; i++) {

                if (bytes[i] != pngSignature[i]) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                return "image/png";
            }
        }

        return null;
    }

    // =========================================================
    // FILE EXTENSION
    // =========================================================

    private String extensionFor(String contentType) {

        return switch (contentType) {

            case "application/pdf" -> ".pdf";

            case "image/jpeg" -> ".jpg";

            case "image/png" -> ".png";

            default -> throw new IllegalArgumentException(
                    "Unsupported file type."
            );
        };
    }

    private String getExtension(String name) {

        if (name == null) {
            return "";
        }

        int index = name.lastIndexOf('.');

        if (index < 0) {
            return "";
        }

        return name.substring(index)
                .toLowerCase(Locale.ROOT);
    }

    // =========================================================
    // SAFE ORIGINAL FILE NAME
    // =========================================================

    private String safeOriginalFileName(String name) {

        if (name == null || name.isBlank()) {

            throw new IllegalArgumentException(
                    "Original filename is required."
            );
        }

        // Normalize Windows and Unix path separators.

        String normalized = name.replace('\\', '/');

        String safeName = normalized.substring(
                normalized.lastIndexOf('/') + 1
        );

        if (safeName.isBlank()
                || safeName.equals(".")
                || safeName.equals("..")) {

            throw new IllegalArgumentException(
                    "Invalid filename."
            );
        }

        return safeName.length() > 200
                ? safeName.substring(safeName.length() - 200)
                : safeName;
    }

    // =========================================================
    // STUDENT DOCUMENTS
    // =========================================================

    public List<UploadedDocument> mine(
            Long appId,
            Long userId) {

        apps.findByIdAndStudentId(appId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Application not found"
                        ));

        return docs.findByApplicationId(appId);
    }

    // =========================================================
    // ADMIN DOCUMENTS
    // =========================================================

    public List<UploadedDocument> forAdmin(Long appId) {

        if (!apps.existsById(appId)) {

            throw new NoSuchElementException(
                    "Application not found"
            );
        }

        return docs.findByApplicationId(appId);
    }

    // =========================================================
    // ADMIN VERIFIES OR REJECTS DOCUMENT
    // =========================================================

    @Transactional
    public UploadedDocument verify(
            Long docId,
            Long adminId,
            boolean verified,
            String remark) {

        UploadedDocument document = docs.findById(docId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Document not found"
                        ));

        User admin = users.findById(adminId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Admin not found"
                        ));

        if (remark != null && remark.length() > 1000) {

            throw new IllegalArgumentException(
                    "Remark cannot exceed 1000 characters."
            );
        }

        document.setVerified(verified);
        document.setVerificationRemark(remark);
        document.setReviewedBy(admin);
        document.setReviewedAt(LocalDateTime.now());

        return docs.save(document);
    }

    // =========================================================
    // ADMIN LOADS DOCUMENT
    // =========================================================

    public Resource loadForAdmin(Long docId) {

        UploadedDocument document = docs.findById(docId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Document not found"
                        ));

        return resourceFor(document);
    }

    // =========================================================
    // STUDENT LOADS OWN DOCUMENT
    // =========================================================

    public Resource load(Long docId, Long userId) {

        UploadedDocument document = docs.findById(docId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Document not found"
                        ));

        apps.findByIdAndStudentId(
                document.getApplication().getId(),
                userId
        ).orElseThrow(() ->
                new NoSuchElementException(
                        "Document not found"
                ));

        return resourceFor(document);
    }

    // =========================================================
    // LOAD FILE FROM PRIVATE UPLOAD DIRECTORY
    // =========================================================

    private Resource resourceFor(UploadedDocument document) {

        try {

            Path root = Paths.get(uploadDir)
                    .toAbsolutePath()
                    .normalize();

            Path path = root.resolve(
                    document.getStoredFileName()
            ).normalize();

            if (!path.startsWith(root)) {

                throw new IllegalArgumentException(
                        "Invalid file path."
                );
            }

            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {

                throw new NoSuchElementException(
                        "Document file not found."
                );
            }

            return resource;

        } catch (Exception e) {

            throw new NoSuchElementException(
                    "Document file not found."
            );
        }
    }

    // =========================================================
    // STUDENT DOCUMENT CHECKLIST
    // =========================================================

    public List<DocumentChecklistItem> checklist(
            Long applicationId,
            Long userId) {

        apps.findByIdAndStudentId(applicationId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Application not found"
                        ));

        return CHECKLIST_DOCUMENTS.stream()
                .map(type -> {

                    boolean required =
                            REQUIRED_DOCUMENTS.contains(type);

                    Optional<UploadedDocument> optional =
                            docs.findFirstByApplicationIdAndDocumentTypeOrderByUploadedAtDescIdDesc(
                                    applicationId,
                                    type
                            );

                    if (optional.isEmpty()) {

                        return new DocumentChecklistItem(
                                type,
                                required,
                                false,
                                "MISSING",
                                null,
                                null,
                                null,
                                null
                        );
                    }

                    UploadedDocument document = optional.get();

                    String status;

                    if (document.isVerified()) {
                        status = "VERIFIED";
                    } else if (document.getReviewedAt() == null) {
                        status = "PENDING";
                    } else {
                        status = "REJECTED";
                    }

                    return new DocumentChecklistItem(
                            type,
                            required,
                            true,
                            status,
                            document.getId(),
                            document.getOriginalFileName(),
                            document.getVerificationRemark(),
                            document.getUploadedAt()
                    );
                })
                .toList();
    }
}