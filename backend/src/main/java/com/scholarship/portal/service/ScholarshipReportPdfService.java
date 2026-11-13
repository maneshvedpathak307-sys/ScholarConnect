package com.scholarship.portal.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.scholarship.portal.dto.ScholarshipReportResponse;

import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class ScholarshipReportPdfService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    private static final DateTimeFormatter DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public byte[] generate(ScholarshipReportResponse report) {

        try (ByteArrayOutputStream output =
                     new ByteArrayOutputStream()) {

            // Landscape A4 with compact margins.
            Document document = new Document(
                    PageSize.A4.rotate(),
                    25, 25, 22, 22
            );

            PdfWriter.getInstance(document, output);

            document.open();

            // ----------------------------------
            // BLACK AND WHITE FONTS
            // ----------------------------------

            Font titleFont = new Font(
                    Font.HELVETICA,
                    19,
                    Font.BOLD,
                    Color.BLACK
            );

            Font subtitleFont = new Font(
                    Font.HELVETICA,
                    9,
                    Font.NORMAL,
                    Color.BLACK
            );

            Font headingFont = new Font(
                    Font.HELVETICA,
                    11,
                    Font.BOLD,
                    Color.BLACK
            );

            Font normalFont = new Font(
                    Font.HELVETICA,
                    8,
                    Font.NORMAL,
                    Color.BLACK
            );

            Font boldFont = new Font(
                    Font.HELVETICA,
                    8,
                    Font.BOLD,
                    Color.BLACK
            );

            Font smallFont = new Font(
                    Font.HELVETICA,
                    7,
                    Font.NORMAL,
                    Color.BLACK
            );

            Font tableHeaderFont = new Font(
                    Font.HELVETICA,
                    7,
                    Font.BOLD,
                    Color.BLACK
            );

            // ----------------------------------
            // REPORT TITLE
            // ----------------------------------

            Paragraph title = new Paragraph(
                    "SCHOLARCONNECT",
                    titleFont
            );

            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(2f);

            document.add(title);

            Paragraph subtitle = new Paragraph(
                    "SCHOLARSHIP APPLICATION REPORT",
                    headingFont
            );

            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(2f);

            document.add(subtitle);

            Paragraph description = new Paragraph(
                    "Postgraduate Scholarship Management Portal",
                    subtitleFont
            );

            description.setAlignment(Element.ALIGN_CENTER);
            description.setSpacingAfter(9f);

            document.add(description);

            // ----------------------------------
            // SCHOLARSHIP DETAILS
            // ----------------------------------

            addSectionHeading(
                    document,
                    "Scholarship Details",
                    headingFont
            );

            PdfPTable details = new PdfPTable(2);

            details.setWidthPercentage(100);
            details.setWidths(new float[]{1.7f, 4.3f});
            details.setSpacingBefore(3f);
            details.setSpacingAfter(7f);

            addDetail(
                    details,
                    "Scholarship Name",
                    report.scholarshipName(),
                    normalFont,
                    boldFont
            );

            // Scholarship ID intentionally omitted.

            addDetail(
                    details,
                    "Scholarship Application Period",
                    formatDate(report.scholarshipStartDate())
                            + " to "
                            + formatDate(report.scholarshipEndDate()),
                    normalFont,
                    boldFont
            );

            addDetail(
                    details,
                    "Report Period",
                    formatDate(report.reportFromDate())
                            + " to "
                            + formatDate(report.reportToDate()),
                    normalFont,
                    boldFont
            );

            document.add(details);

            // ----------------------------------
            // APPLICATION SUMMARY
            // ----------------------------------

            addSectionHeading(
                    document,
                    "Application Summary",
                    headingFont
            );

            PdfPTable summary = new PdfPTable(4);

            summary.setWidthPercentage(100);
            summary.setWidths(
                    new float[]{1, 1, 1, 1}
            );

            summary.setSpacingBefore(3f);
            summary.setSpacingAfter(5f);

            addSummaryCell(
                    summary,
                    "TOTAL APPLICATIONS",
                    report.totalApplications(),
                    boldFont
            );

            addSummaryCell(
                    summary,
                    "PENDING",
                    report.pendingApplications(),
                    boldFont
            );

            addSummaryCell(
                    summary,
                    "APPROVED",
                    report.approvedApplications(),
                    boldFont
            );

            addSummaryCell(
                    summary,
                    "REJECTED",
                    report.rejectedApplications(),
                    boldFont
            );

            document.add(summary);

            Paragraph breakdown = new Paragraph(
                    "Pending Breakdown: Submitted: "
                            + report.submittedApplications()
                            + " | Under Review: "
                            + report.underReviewApplications()
                            + " | Correction Requested: "
                            + report.correctionRequestedApplications(),
                    normalFont
            );

            breakdown.setSpacingBefore(2f);
            breakdown.setSpacingAfter(7f);

            document.add(breakdown);

            // ----------------------------------
            // APPLICATION DETAILS
            // ----------------------------------

            addSectionHeading(
                    document,
                    "Application Details",
                    headingFont
            );

            PdfPTable table = new PdfPTable(5);

            table.setWidthPercentage(100);

            table.setWidths(
                    new float[]{
                            1.55f,
                            2.1f,
                            2.8f,
                            2.1f,
                            1.8f
                    }
            );

            table.setSpacingBefore(3f);
            table.setSpacingAfter(2f);

            // Repeat table heading on additional pages.
            table.setHeaderRows(1);

            // Allow rows to continue naturally onto later pages.
            table.setSplitRows(true);
            table.setSplitLate(false);

            addHeader(
                    table,
                    "Application Number",
                    tableHeaderFont
            );

            addHeader(
                    table,
                    "Student Name",
                    tableHeaderFont
            );

            addHeader(
                    table,
                    "Email Address",
                    tableHeaderFont
            );

            addHeader(
                    table,
                    "Submitted Date",
                    tableHeaderFont
            );

            addHeader(
                    table,
                    "Status",
                    tableHeaderFont
            );

            if (report.applications() == null
                    || report.applications().isEmpty()) {

                PdfPCell empty = new PdfPCell(
                        new Phrase(
                                "No submitted applications found for this report period.",
                                normalFont
                        )
                );

                empty.setColspan(5);
                empty.setPadding(8f);

                empty.setHorizontalAlignment(
                        Element.ALIGN_CENTER
                );

                empty.setVerticalAlignment(
                        Element.ALIGN_MIDDLE
                );

                table.addCell(empty);

            } else {

                for (var application : report.applications()) {

                    addCell(
                            table,
                            application.applicationNumber(),
                            smallFont
                    );

                    addCell(
                            table,
                            application.studentName(),
                            smallFont
                    );

                    addCell(
                            table,
                            application.studentEmail(),
                            smallFont
                    );

                    addCell(
                            table,
                            application.applicationDate() == null
                                    ? "-"
                                    : DATE_TIME_FORMAT.format(
                                            application.applicationDate()
                                    ),
                            smallFont
                    );

                    addCell(
                            table,
                            formatStatus(application.status()),
                            smallFont
                    );
                }
            }

            document.add(table);

            // ----------------------------------
            // FOOTER
            // ----------------------------------

            Paragraph footer = new Paragraph(
                    "Generated by ScholarConnect Admin Portal. "
                            + "This report contains submitted applications "
                            + "within the selected date range.",
                    smallFont
            );

            footer.setAlignment(Element.ALIGN_CENTER);

            // Keep the footer compact.
            footer.setSpacingBefore(3f);
            footer.setSpacingAfter(0f);
            footer.setLeading(9f);

            // If there is not enough room, move the
            // complete footer to the next page.
            footer.setKeepTogether(true);

            document.add(footer);

            document.close();

            return output.toByteArray();

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Unable to generate scholarship report PDF.",
                    exception
            );
        }
    }

    // ----------------------------------
    // SECTION HEADING
    // ----------------------------------

    private void addSectionHeading(
            Document document,
            String heading,
            Font font) throws Exception {

        Paragraph paragraph = new Paragraph(
                heading,
                font
        );

        paragraph.setSpacingBefore(8f);
        paragraph.setSpacingAfter(3f);
        paragraph.setKeepTogether(true);

        document.add(paragraph);
    }

    // ----------------------------------
    // SCHOLARSHIP DETAILS ROW
    // ----------------------------------

    private void addDetail(
            PdfPTable table,
            String label,
            String value,
            Font normalFont,
            Font boldFont) {

        PdfPCell labelCell = new PdfPCell(
                new Phrase(label, boldFont)
        );

        labelCell.setPadding(5f);
        labelCell.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );
        labelCell.setBackgroundColor(Color.WHITE);
        labelCell.setBorderColor(Color.BLACK);

        PdfPCell valueCell = new PdfPCell(
                new Phrase(
                        value == null ? "-" : value,
                        normalFont
                )
        );

        valueCell.setPadding(5f);
        valueCell.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );
        valueCell.setBackgroundColor(Color.WHITE);
        valueCell.setBorderColor(Color.BLACK);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    // ----------------------------------
    // SUMMARY CELLS
    // ----------------------------------

    private void addSummaryCell(
            PdfPTable table,
            String label,
            long value,
            Font font) {

        PdfPCell cell = new PdfPCell();

        Paragraph paragraph = new Paragraph(
                label + "\n" + value,
                font
        );

        paragraph.setAlignment(
                Element.ALIGN_CENTER
        );

        cell.addElement(paragraph);
        cell.setPadding(8f);
        cell.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );
        cell.setBackgroundColor(Color.WHITE);
        cell.setBorderColor(Color.BLACK);

        table.addCell(cell);
    }

    // ----------------------------------
    // TABLE HEADER
    // ----------------------------------

    private void addHeader(
            PdfPTable table,
            String value,
            Font font) {

        PdfPCell cell = new PdfPCell(
                new Phrase(value, font)
        );

        cell.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        cell.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );

        cell.setPadding(6f);
        cell.setBackgroundColor(Color.WHITE);
        cell.setBorderColor(Color.BLACK);
        cell.setNoWrap(true);

        table.addCell(cell);
    }

    // ----------------------------------
    // TABLE DATA CELL
    // ----------------------------------

    private void addCell(
            PdfPTable table,
            String value,
            Font font) {

        PdfPCell cell = new PdfPCell(
                new Phrase(
                        value == null || value.isBlank()
                                ? "-"
                                : value,
                        font
                )
        );

        cell.setPadding(5f);
        cell.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );

        cell.setBackgroundColor(Color.WHITE);
        cell.setBorderColor(Color.BLACK);

        table.addCell(cell);
    }

    // ----------------------------------
    // FRIENDLY STATUS
    // ----------------------------------

    private String formatStatus(String status) {

        if (status == null || status.isBlank()) {
            return "-";
        }

        String normalized = status
                .trim()
                .replace('_', ' ')
                .toLowerCase(Locale.ROOT);

        String[] words = normalized.split("\\s+");

        StringBuilder result = new StringBuilder();

        for (String word : words) {

            if (result.length() > 0) {
                result.append(" ");
            }

            result.append(
                    word.substring(0, 1)
                            .toUpperCase(Locale.ROOT)
            );

            if (word.length() > 1) {
                result.append(word.substring(1));
            }
        }

        return result.toString();
    }

    // ----------------------------------
    // DATE FORMAT
    // ----------------------------------

    private String formatDate(LocalDate date) {

        return date == null
                ? "-"
                : DATE_FORMAT.format(date);
    }
}