package com.scholarship.portal.service;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.scholarship.portal.dto.ApplicationResponse;
import com.scholarship.portal.dto.ApplicationResponse.EducationResponse;
import com.scholarship.portal.entity.UploadedDocument;
import com.scholarship.portal.enums.DocumentType;
import com.scholarship.portal.repository.UploadedDocumentRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ApplicationPdfService {

    private final UploadedDocumentRepository documentRepository;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    private static final Set<String> ALLOWED_EDUCATION_LEVELS =
            Set.of("10TH", "12TH", "GRADUATION");

    // =====================================================
    // GENERATE APPLICATION PDF
    // =====================================================

    public byte[] generate(ApplicationResponse app) {

        if (app == null || app.id() == null) {
            throw new IllegalArgumentException(
                    "Application information is required."
            );
        }

        List<UploadedDocument> uploadedDocuments =
                documentRepository.findByApplicationId(app.id());

        try (ByteArrayOutputStream output =
                     new ByteArrayOutputStream()) {

            Document document =
                    new Document(PageSize.A4, 30, 30, 25, 30);

            PdfWriter.getInstance(document, output);
            document.open();

            Font titleFont =
                    new Font(Font.HELVETICA, 17, Font.BOLD);

            Font subtitleFont =
                    new Font(Font.HELVETICA, 9, Font.NORMAL);

            Font headingFont =
                    new Font(Font.HELVETICA, 10, Font.BOLD);

            Font normalFont =
                    new Font(Font.HELVETICA, 8, Font.NORMAL);

            Font boldFont =
                    new Font(Font.HELVETICA, 8, Font.BOLD);

            Font smallFont =
                    new Font(Font.HELVETICA, 7, Font.NORMAL);

            Font documentFont =
                    new Font(Font.HELVETICA, 7, Font.NORMAL);

            Font documentBoldFont =
                    new Font(Font.HELVETICA, 7, Font.BOLD);

            // =================================================
            // HEADER: TITLE, PHOTO AND SIGNATURE
            // =================================================

            addHeader(
                    document,
                    uploadedDocuments,
                    titleFont,
                    subtitleFont,
                    smallFont
            );

            // =================================================
            // 1. APPLICATION DETAILS
            // =================================================

            addSection(
                    document,
                    "1. APPLICATION DETAILS",
                    headingFont
            );

            PdfPTable applicationTable = createTable();

            addRow(applicationTable, "Application Number",
                    app.applicationNumber(), boldFont, normalFont);

            addRow(applicationTable, "Application Status",
                    app.status(), boldFont, normalFont);

            addRow(applicationTable, "Submission Date",
                    formatDate(app.submittedAt()), boldFont, normalFont);

            addRow(applicationTable, "Scholarship Name",
                    app.scholarship() == null
                            ? "-"
                            : app.scholarship().name(),
                    boldFont, normalFont);

            addRow(applicationTable, "Award Amount",
                    app.scholarship() == null
                            || app.scholarship().awardAmount() == null
                            ? "-"
                            : "INR " + app.scholarship().awardAmount(),
                    boldFont, normalFont);

            document.add(applicationTable);

            // =================================================
            // 2. STUDENT DETAILS
            // =================================================

            addSection(
                    document,
                    "2. STUDENT DETAILS",
                    headingFont
            );

            PdfPTable studentTable = createTable();

            if (app.student() != null) {

                addRow(studentTable, "Full Name",
                        app.student().fullName(), boldFont, normalFont);

                addRow(studentTable, "Email",
                        app.student().email(), boldFont, normalFont);

                addRow(studentTable, "Mobile Number",
                        app.student().mobileNumber(), boldFont, normalFont);

                addRow(studentTable, "Date of Birth",
                        app.student().dateOfBirth() == null
                                ? "-"
                                : app.student().dateOfBirth().toString(),
                        boldFont, normalFont);

                addRow(studentTable, "Gender",
                        app.student().gender(), boldFont, normalFont);
            }

            addRow(studentTable, "Disability",
                    Boolean.TRUE.equals(app.handicapped())
                            ? "Yes" : "No",
                    boldFont, normalFont);

            addRow(studentTable, "Course",
                    app.currentCourse(), boldFont, normalFont);

            addRow(studentTable, "College",
                    app.collegeName(), boldFont, normalFont);

            addRow(studentTable, "Current Year / Semester",
                    app.currentYear() == null
                            ? "-"
                            : app.currentYear().toString(),
                    boldFont, normalFont);

            addRow(studentTable, "Category",
                    app.academicCategory(), boldFont, normalFont);

            document.add(studentTable);

            // =================================================
            // 3. FAMILY DETAILS
            // =================================================

            addSection(
                    document,
                    "3. FAMILY DETAILS",
                    headingFont
            );

            PdfPTable familyTable = createTable();

            addRow(familyTable, "Father / Guardian Name",
                    app.fatherName(), boldFont, normalFont);

            addRow(familyTable, "Father Occupation",
                    app.fatherOccupation(), boldFont, normalFont);

            addRow(familyTable, "Father Mobile",
                    app.fatherMobileNumber(), boldFont, normalFont);

            addRow(familyTable, "Mother Name",
                    app.motherName(), boldFont, normalFont);

            addRow(familyTable, "Mother Occupation",
                    app.motherOccupation(), boldFont, normalFont);

            addRow(familyTable, "Mother Mobile",
                    app.motherMobileNumber(), boldFont, normalFont);

            addRow(familyTable, "Annual Family Income",
                    app.annualFamilyIncome() == null
                            ? "-"
                            : "INR " + app.annualFamilyIncome(),
                    boldFont, normalFont);

            document.add(familyTable);

            // =================================================
            // 4. EDUCATION DETAILS
            // EDUCATION NOW CONTINUES ON PAGE 1
            // =================================================

            addSection(
                    document,
                    "4. EDUCATION DETAILS",
                    headingFont
            );

            PdfPTable educationTable = new PdfPTable(5);

            educationTable.setWidthPercentage(100);

            educationTable.setWidths(
                    new float[]{1.3f, 2.4f, 2.1f, 0.9f, 1.2f}
            );

            educationTable.setSpacingAfter(4);
            educationTable.setKeepTogether(true);

            addCompactHeader(
                    educationTable, "Level", documentBoldFont
            );

            addCompactHeader(
                    educationTable, "Institution", documentBoldFont
            );

            addCompactHeader(
                    educationTable, "Board / University", documentBoldFont
            );

            addCompactHeader(
                    educationTable, "Year", documentBoldFont
            );

            addCompactHeader(
                    educationTable, "Result", documentBoldFont
            );

            boolean hasEducation = false;

            if (app.education() != null) {

                for (EducationResponse education : app.education()) {

                    if (education.educationLevel() == null) {
                        continue;
                    }

                    String level =
                            education.educationLevel().toUpperCase();

                    if (!ALLOWED_EDUCATION_LEVELS.contains(level)) {
                        continue;
                    }

                    hasEducation = true;

                    addCompactCell(
                            educationTable,
                            level,
                            documentFont
                    );

                    addCompactCell(
                            educationTable,
                            education.institutionName(),
                            documentFont
                    );

                    addCompactCell(
                            educationTable,
                            education.boardOrUniversity(),
                            documentFont
                    );

                    addCompactCell(
                            educationTable,
                            education.passingYear() == null
                                    ? "-"
                                    : education.passingYear().toString(),
                            documentFont
                    );

                    String result = "-";

                    if (education.percentage() != null) {
                        result = education.percentage() + "%";
                    } else if (education.cgpa() != null) {
                        result = education.cgpa() + " CGPA";
                    }

                    addCompactCell(
                            educationTable,
                            result,
                            documentFont
                    );
                }
            }

            if (!hasEducation) {

                PdfPCell emptyCell = new PdfPCell(
                        new Phrase(
                                "No education records available",
                                documentFont
                        )
                );

                emptyCell.setColspan(5);
                emptyCell.setPadding(3);

                educationTable.addCell(emptyCell);
            }

            document.add(educationTable);

            // =================================================
            // START PAGE 2 AFTER EDUCATION DETAILS
            // =================================================

            document.newPage();

            // =================================================
            // 5. BANK DETAILS
            // PAGE 2 STARTS HERE
            // =================================================

            addSection(
                    document,
                    "5. BANK DETAILS",
                    headingFont
            );

            PdfPTable bankTable = createCompactTable();

            addCompactRow(bankTable, "Account Holder",
                    app.accountHolderName(),
                    documentBoldFont, documentFont);

            addCompactRow(bankTable, "Bank Name",
                    app.bankName(),
                    documentBoldFont, documentFont);

            addCompactRow(bankTable, "Branch",
                    app.branchName(),
                    documentBoldFont, documentFont);

            addCompactRow(bankTable, "IFSC Code",
                    app.ifscCode(),
                    documentBoldFont, documentFont);

            addCompactRow(bankTable, "Account Number",
                    app.maskedAccountNumber(),
                    documentBoldFont, documentFont);

            document.add(bankTable);

            // =================================================
            // 6. SCHOLARSHIP REASON
            // =================================================

            addSection(
                    document,
                    "6. SCHOLARSHIP REASON",
                    headingFont
            );

            Paragraph reason = new Paragraph(
                    safe(app.scholarshipReason()),
                    documentFont
            );

            reason.setSpacingAfter(3);
            document.add(reason);

            // =================================================
            // 7. UPLOADED DOCUMENTS
            // =================================================

            addSection(
                    document,
                    "7. UPLOADED DOCUMENTS",
                    headingFont
            );

            addUploadedDocuments(
                    document,
                    uploadedDocuments,
                    documentFont,
                    documentBoldFont
            );

            // =================================================
            // FOOTER
            // =================================================

            Paragraph footer = new Paragraph(
                    "Generated by ScholarConnect - PG Scholarship Management Portal",
                    smallFont
            );

            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(5);

            document.add(footer);

            document.close();

            return output.toByteArray();

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Unable to generate application PDF",
                    exception
            );
        }
    }

    // =====================================================
    // HEADER WITH APPLICANT PHOTO AND SIGNATURE
    // =====================================================

    private void addHeader(
            Document document,
            List<UploadedDocument> documents,
            Font titleFont,
            Font subtitleFont,
            Font smallFont) throws Exception {

        PdfPTable header = new PdfPTable(
                new float[]{3.5f, 1.2f}
        );

        header.setWidthPercentage(100);

        PdfPCell titleCell = new PdfPCell();

        titleCell.setBorder(PdfPCell.NO_BORDER);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Paragraph title = new Paragraph(
                "SCHOLARSHIP APPLICATION",
                titleFont
        );

        title.setAlignment(Element.ALIGN_CENTER);
        titleCell.addElement(title);

        Paragraph subtitle = new Paragraph(
                "Postgraduate Student Scholarship Portal",
                subtitleFont
        );

        subtitle.setAlignment(Element.ALIGN_CENTER);
        titleCell.addElement(subtitle);

        titleCell.addElement(new Paragraph(" "));

        header.addCell(titleCell);

        PdfPTable imageTable = new PdfPTable(1);

        imageTable.setWidthPercentage(100);

        UploadedDocument photograph =
                findLatestDocument(documents, DocumentType.PHOTOGRAPH);

        UploadedDocument signature =
                findLatestDocument(documents, DocumentType.SIGNATURE);

        addImageCell(
                imageTable,
                photograph,
                "APPLICANT PHOTO",
                smallFont,
                75,
                85
        );

        addImageCell(
                imageTable,
                signature,
                "APPLICANT SIGNATURE",
                smallFont,
                75,
                35
        );

        PdfPCell imageCell = new PdfPCell(imageTable);

        imageCell.setBorder(PdfPCell.NO_BORDER);
        imageCell.setPadding(2);

        header.addCell(imageCell);

        document.add(header);
        document.add(new Paragraph(" "));
    }

    // =====================================================
    // PHOTO / SIGNATURE CELL
    // =====================================================

    private void addImageCell(
            PdfPTable table,
            UploadedDocument uploaded,
            String label,
            Font font,
            float maxWidth,
            float maxHeight) {

        PdfPCell cell = new PdfPCell();

        cell.setPadding(4);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        try {

            if (uploaded != null) {

                Path file = resolveUploadedFile(uploaded);

                if (Files.exists(file) && Files.isRegularFile(file)) {

                    Image image = Image.getInstance(
                            Files.readAllBytes(file)
                    );

                    image.scaleToFit(maxWidth, maxHeight);
                    image.setAlignment(Element.ALIGN_CENTER);

                    cell.addElement(image);

                } else {

                    cell.addElement(
                            new Paragraph("Image file unavailable", font)
                    );
                }

            } else {

                cell.addElement(
                        new Paragraph("Not uploaded", font)
                );
            }

        } catch (Exception exception) {

            cell.addElement(
                    new Paragraph("Image preview unavailable", font)
            );
        }

        Paragraph caption = new Paragraph(label, font);
        caption.setAlignment(Element.ALIGN_CENTER);

        cell.addElement(caption);
        table.addCell(cell);
    }

    // =====================================================
    // GET LATEST DOCUMENT BY TYPE
    // =====================================================

    private UploadedDocument findLatestDocument(
            List<UploadedDocument> documents,
            DocumentType type) {

        return documents.stream()
                .filter(d -> d.getDocumentType() == type)
                .max(
                        Comparator
                                .comparing(
                                        UploadedDocument::getUploadedAt,
                                        Comparator.nullsFirst(
                                                Comparator.naturalOrder()
                                        )
                                )
                                .thenComparing(
                                        UploadedDocument::getId,
                                        Comparator.nullsFirst(
                                                Comparator.naturalOrder()
                                        )
                                )
                )
                .orElse(null);
    }

    // =====================================================
    // UPLOADED DOCUMENTS: COMPACT TWO-COLUMN TABLE
    // =====================================================

    private void addUploadedDocuments(
            Document document,
            List<UploadedDocument> documents,
            Font normalFont,
            Font boldFont) throws Exception {

        PdfPTable table = new PdfPTable(2);

        table.setWidthPercentage(100);

        table.setWidths(
                new float[]{3.5f, 1.5f}
        );

        table.setKeepTogether(true);

        table.setSpacingBefore(0);
        table.setSpacingAfter(2);

        addCompactHeader(table, "Document", boldFont);
        addCompactHeader(table, "Status", boldFont);

        List<UploadedDocument> supportingDocuments =
                documents.stream()
                        .filter(d ->
                                d.getDocumentType()
                                        != DocumentType.PHOTOGRAPH
                                && d.getDocumentType()
                                        != DocumentType.SIGNATURE
                        )
                        .sorted(
                                Comparator.comparing(
                                        UploadedDocument::getUploadedAt,
                                        Comparator.nullsLast(
                                                Comparator.naturalOrder()
                                        )
                                )
                        )
                        .toList();

        if (supportingDocuments.isEmpty()) {

            PdfPCell emptyCell = new PdfPCell(
                    new Phrase(
                            "No supporting documents uploaded",
                            normalFont
                    )
            );

            emptyCell.setColspan(2);
            emptyCell.setPadding(3);

            table.addCell(emptyCell);

        } else {

            for (UploadedDocument uploaded : supportingDocuments) {

                addCompactCell(
                        table,
                        uploaded.getDocumentType().name()
                                .replace('_', ' '),
                        normalFont
                );

                addCompactStatusCell(
                        table,
                        uploaded,
                        normalFont
                );
            }
        }

        document.add(table);
    }

    // =====================================================
    // COMPACT STATUS CELL WITH CHECK MARK
    // =====================================================

    private void addCompactStatusCell(
            PdfPTable table,
            UploadedDocument uploaded,
            Font normalFont) {

        PdfPCell cell = new PdfPCell();

        cell.setPadding(3);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        if (uploaded.getReviewedAt() != null
                && !uploaded.isVerified()) {

            cell.addElement(
                    new Paragraph(
                            "Re-upload required",
                            normalFont
                    )
            );

        } else {

            Font checkFont =
                    new Font(Font.ZAPFDINGBATS, 9, Font.BOLD);

            Phrase statusPhrase = new Phrase();

            statusPhrase.add(new Chunk("4", checkFont));

            statusPhrase.add(
                    new Chunk(
                            uploaded.isVerified()
                                    ? " Verified"
                                    : " Uploaded",
                            normalFont
                    )
            );

            cell.addElement(new Paragraph(statusPhrase));
        }

        table.addCell(cell);
    }

    // =====================================================
    // SAFE PRIVATE UPLOAD PATH
    // =====================================================

    private Path resolveUploadedFile(
            UploadedDocument uploaded) {

        Path root = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Path file = root.resolve(
                uploaded.getStoredFileName()
        ).normalize();

        if (!file.startsWith(root)) {

            throw new IllegalArgumentException(
                    "Invalid uploaded document path."
            );
        }

        return file;
    }

    // =====================================================
    // DATE FORMAT
    // =====================================================

    private String formatDate(LocalDateTime date) {

        return date == null
                ? "Not submitted"
                : DATE_FORMAT.format(date);
    }

    // =====================================================
    // NORMAL TWO-COLUMN TABLE
    // =====================================================

    private PdfPTable createTable() {

        PdfPTable table = new PdfPTable(2);

        table.setWidthPercentage(100);

        table.setWidths(
                new float[]{1.5f, 2.5f}
        );

        table.setSpacingAfter(4);

        return table;
    }

    // =====================================================
    // COMPACT TWO-COLUMN TABLE
    // =====================================================

    private PdfPTable createCompactTable() {

        PdfPTable table = new PdfPTable(2);

        table.setWidthPercentage(100);

        table.setWidths(
                new float[]{1.5f, 2.5f}
        );

        table.setSpacingAfter(3);

        return table;
    }

    // =====================================================
    // SECTION HEADING
    // =====================================================

    private void addSection(
            Document document,
            String heading,
            Font font) throws Exception {

        Paragraph paragraph = new Paragraph(heading, font);

        paragraph.setSpacingBefore(5);
        paragraph.setSpacingAfter(2);

        document.add(paragraph);
    }

    // =====================================================
    // NORMAL TABLE ROW
    // =====================================================

    private void addRow(
            PdfPTable table,
            String label,
            String value,
            Font labelFont,
            Font valueFont) {

        addCell(table, label, labelFont);
        addCell(table, safe(value), valueFont);
    }

    // =====================================================
    // COMPACT TABLE ROW
    // =====================================================

    private void addCompactRow(
            PdfPTable table,
            String label,
            String value,
            Font labelFont,
            Font valueFont) {

        addCompactCell(table, label, labelFont);
        addCompactCell(table, safe(value), valueFont);
    }

    // =====================================================
    // COMPACT TABLE HEADER
    // =====================================================

    private void addCompactHeader(
            PdfPTable table,
            String value,
            Font font) {

        PdfPCell cell = new PdfPCell(
                new Phrase(safe(value), font)
        );

        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(3);

        table.addCell(cell);
    }

    // =====================================================
    // NORMAL TABLE CELL
    // =====================================================

    private void addCell(
            PdfPTable table,
            String value,
            Font font) {

        PdfPCell cell = new PdfPCell(
                new Phrase(safe(value), font)
        );

        cell.setPadding(4);

        table.addCell(cell);
    }

    // =====================================================
    // COMPACT TABLE CELL
    // =====================================================

    private void addCompactCell(
            PdfPTable table,
            String value,
            Font font) {

        PdfPCell cell = new PdfPCell(
                new Phrase(safe(value), font)
        );

        cell.setPadding(3);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        table.addCell(cell);
    }

    // =====================================================
    // NULL VALUE HANDLING
    // =====================================================

    private String safe(String value) {

        return value == null || value.isBlank()
                ? "-"
                : value;
    }
}