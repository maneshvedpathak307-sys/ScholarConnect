import React, { useEffect, useMemo, useState } from "react";

import {
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";

import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  GraduationCap,
  MessageSquare,
  Clock,
  XCircle,
  Eye,
  X
} from "lucide-react";

import StudentSidebar from "../../components/StudentSidebar";
import api from "../../services/api";

import "../../styles/ApplyScholarship.css";

// =========================================================
// REQUIRED DOCUMENTS
// Photograph and Signature: JPG/JPEG/PNG only.
// All other documents: PDF only.
// =========================================================

const REQUIRED_DOCUMENTS = [
  { type: "PHOTOGRAPH", label: "Photograph", imageOnly: true },
  { type: "SIGNATURE", label: "Student Signature", imageOnly: true },
  { type: "AADHAAR", label: "Aadhaar Card" },
  { type: "MARKSHEET_10TH", label: "10th Marksheet" },
  { type: "MARKSHEET_12TH", label: "12th Marksheet" },
  { type: "GRADUATION_MARKSHEET", label: "Graduation Marksheet" },
  { type: "INCOME_CERTIFICATE", label: "Income Certificate" },
  { type: "BANK_PASSBOOK", label: "Bank Passbook" },
  { type: "CASTE_CERTIFICATE", label: "Caste Certificate" },
  { type: "NON_CREAMY_LAYER", label: "Non-Creamy Layer Certificate" },
  { type: "DOMICILE_CERTIFICATE", label: "Domicile Certificate" },
  { type: "BONAFIDE_CERTIFICATE", label: "Bonafide Certificate" }
];

const OPTIONAL_DOCUMENTS = [
  { type: "PREVIOUS_YEAR_MARKSHEET", label: "Previous Year Marksheet" },
  { type: "CASTE_VALIDITY", label: "Caste Validity Certificate" },
  { type: "PAN", label: "PAN Card" },
  { type: "RATION_CARD", label: "Ration Card" },
  { type: "OTHER", label: "Other Supporting Document" }
];

// =========================================================
// ONLY THREE COMPLETED EDUCATION RECORDS
// Current PG details are maintained separately.
// =========================================================

const REQUIRED_EDUCATION_LEVELS = [
  { value: "10TH", label: "10th Standard" },
  { value: "12TH", label: "12th Standard" },
  { value: "GRADUATION", label: "Graduation" }
];

const emptyEducation = level => ({
  educationLevel: level,
  institutionName: "",
  boardOrUniversity: "",
  passingYear: "",
  percentage: "",
  cgpa: "",
  seatOrRollNumber: ""
});

const createInitialEducation = () =>
  REQUIRED_EDUCATION_LEVELS.map(item =>
    emptyEducation(item.value)
  );

// =========================================================
// EMPTY APPLICATION FORM
// =========================================================

const emptyForm = {
  scholarshipReason: "",
  handicapped: "false",

  fatherName: "",
  fatherOccupation: "",
  fatherMobileNumber: "",

  motherName: "",
  motherOccupation: "",
  motherMobileNumber: "",

  annualFamilyIncome: "",

  accountHolderName: "",
  bankName: "",
  branchName: "",
  accountNumber: "",
  ifscCode: "",

  currentCourse: "",
  collegeName: "",
  currentYear: "",
  academicCategory: ""
};

const inputValue = value =>
  value === null || value === undefined
    ? ""
    : String(value);

// =========================================================
// REUSABLE FIELD
// =========================================================

function Field({ label, required, children }) {
  return (
    <label className="sc-field">
      <span>
        {label}
        {required && <b className="sc-required"> *</b>}
      </span>

      {children}
    </label>
  );
}

// =========================================================
// REUSABLE SECTION
// =========================================================

function Section({ number, title, description, children }) {
  return (
    <section className="sc-form-section">
      <div className="sc-section-heading">
        <span>{number}</span>

        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>

      {children}
    </section>
  );
}

// =========================================================
// GET LATEST DOCUMENTS
// =========================================================

function getLatestDocuments(documents) {
  const result = {};

  [...(documents || [])]
    .sort((a, b) => {
      const dateA = new Date(a.uploadedAt || 0).getTime();
      const dateB = new Date(b.uploadedAt || 0).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      return Number(a.id || 0) - Number(b.id || 0);
    })
    .forEach(doc => {
      result[doc.documentType] = doc;
    });

  return result;
}

// =========================================================
// DOCUMENT STATUS
// =========================================================

function documentStatus(doc) {
  if (!doc) return "NOT UPLOADED";

  if (doc.verified) return "VERIFIED";

  if (doc.reviewedAt) return "REJECTED";

  return "PENDING REVIEW";
}

// =========================================================
// DOCUMENT ACCEPT ATTRIBUTE
// =========================================================

function getDocumentAccept(doc) {
  return doc.imageOnly
    ? ".jpg,.jpeg,.png,image/jpeg,image/png"
    : ".pdf,application/pdf";
}

// =========================================================
// DOCUMENT PREVIEW MODAL
// Opens selected or uploaded document in a popup.
// =========================================================

function DocumentPreviewModal({ document, onClose }) {
  if (!document) return null;

  return (
    <div
      className="sc-preview-overlay"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="sc-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Document preview"
      >
        <div className="sc-preview-modal-header">
          <div>
            <FileText size={20} />

            <div>
              <strong>Document Preview</strong>
              <small>{document.name}</small>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sc-preview-modal-body">
          {document.type === "application/pdf" ? (
            <iframe
              src={document.url}
              title={`Preview ${document.name}`}
              className="sc-preview-pdf"
            />
          ) : document.type.startsWith("image/") ? (
            <img
              src={document.url}
              alt={document.name}
              className="sc-preview-image"
            />
          ) : (
            <div className="sc-preview-unavailable">
              <AlertCircle size={28} />
              <p>
                Preview is not available for this file type.
              </p>
            </div>
          )}
        </div>

        <div className="sc-preview-modal-footer">
          <span>{document.name}</span>

          <button type="button" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function ApplyScholarship() {
  const { scholarshipId } = useParams();

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const existingApplicationId =
    searchParams.get("applicationId");

  const isCorrectionMode =
    Boolean(existingApplicationId);

  const [profile, setProfile] = useState(null);

  const [scholarship, setScholarship] = useState(null);

  const [applicationId, setApplicationId] = useState(
    existingApplicationId || null
  );

  const [latestReviewRemarks, setLatestReviewRemarks] =
    useState("");

  const [form, setForm] = useState({
    ...emptyForm
  });

  const [education, setEducation] = useState(
    createInitialEducation()
  );

  const [documents, setDocuments] = useState([]);

  const [files, setFiles] = useState({});

  const [declaration, setDeclaration] = useState(false);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [previewDocument, setPreviewDocument] = useState(null);

  const [viewingDocument, setViewingDocument] = useState(null);

  const latestDocuments = useMemo(
    () => getLatestDocuments(documents),
    [documents]
  );

  // =======================================================
  // REQUIRED DOCUMENT UPLOAD COUNT
  // =======================================================

  const requiredUploaded = useMemo(() => {
    return REQUIRED_DOCUMENTS.filter(doc => {
      const existing = latestDocuments[doc.type];

      if (existing?.reviewedAt && !existing.verified) {
        return Boolean(files[doc.type]);
      }

      return Boolean(existing || files[doc.type]);
    }).length;
  }, [latestDocuments, files]);

  // =======================================================
  // RELEASE PREVIEW URL
  // =======================================================

  useEffect(() => {
    return () => {
      if (previewDocument?.url) {
        window.URL.revokeObjectURL(previewDocument.url);
      }
    };
  }, [previewDocument]);

  const closeDocumentPreview = () => {
    setPreviewDocument(null);
    setViewingDocument(null);
  };

  // =======================================================
  // LOAD PROFILE, SCHOLARSHIP AND EXISTING APPLICATION
  // =======================================================

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          profileResponse,
          scholarshipResponse
        ] = await Promise.all([
          api.get("/student/profile"),
          api.get("/scholarships/active")
        ]);

        if (!mounted) return;

        setProfile(profileResponse.data);

        let selectedScholarship = null;

        // CORRECTION MODE

        if (existingApplicationId) {
          const applicationResponse = await api.get(
            `/applications/${existingApplicationId}`
          );

          if (!mounted) return;

          const existing = applicationResponse.data;

          if (existing.status !== "CORRECTION_REQUESTED") {
            setError(
              "This application is not currently open for correction."
            );
            return;
          }

          selectedScholarship = existing.scholarship;

          setApplicationId(existing.id);

          setLatestReviewRemarks(
            existing.latestReviewRemarks || ""
          );

          setForm({
            scholarshipReason:
              inputValue(existing.scholarshipReason),

            handicapped:
              existing.handicapped === true
                ? "true"
                : "false",

            fatherName:
              inputValue(existing.fatherName),

            fatherOccupation:
              inputValue(existing.fatherOccupation),

            fatherMobileNumber:
              inputValue(existing.fatherMobileNumber),

            motherName:
              inputValue(existing.motherName),

            motherOccupation:
              inputValue(existing.motherOccupation),

            motherMobileNumber:
              inputValue(existing.motherMobileNumber),

            annualFamilyIncome:
              inputValue(existing.annualFamilyIncome),

            accountHolderName:
              inputValue(existing.accountHolderName),

            bankName:
              inputValue(existing.bankName),

            branchName:
              inputValue(existing.branchName),

            // Keep protected bank details unchanged.
            accountNumber: "",
            ifscCode: "",

            currentCourse:
              inputValue(existing.currentCourse),

            collegeName:
              inputValue(existing.collegeName),

            currentYear:
              inputValue(existing.currentYear),

            academicCategory:
              inputValue(existing.academicCategory)
          });

          // LOAD ONLY 10TH, 12TH AND GRADUATION

          const savedEducation =
            Array.isArray(existing.education)
              ? existing.education.map(item => ({
                  educationLevel:
                    inputValue(item.educationLevel),

                  institutionName:
                    inputValue(item.institutionName),

                  boardOrUniversity:
                    inputValue(item.boardOrUniversity),

                  passingYear:
                    inputValue(item.passingYear),

                  percentage:
                    inputValue(item.percentage),

                  cgpa:
                    inputValue(item.cgpa),

                  seatOrRollNumber:
                    inputValue(item.seatOrRollNumber)
                }))
              : [];

          const requiredRecords =
            REQUIRED_EDUCATION_LEVELS.map(level => {
              return (
                savedEducation.find(
                  item =>
                    item.educationLevel === level.value
                ) || emptyEducation(level.value)
              );
            });

          // Old CURRENT_COURSE education records are ignored.
          // Current PG details come from separate application fields.

          setEducation(requiredRecords);

          // LOAD EXISTING DOCUMENTS

          const documentResponse = await api.get(
            `/documents/application/${existing.id}`
          );

          if (!mounted) return;

          setDocuments(
            Array.isArray(documentResponse.data)
              ? documentResponse.data
              : []
          );
        } else {
          // NEW PG APPLICATION

          selectedScholarship =
            (scholarshipResponse.data || []).find(
              item =>
                String(item.id) === String(scholarshipId) &&
                item.educationLevel === "PG"
            );

          if (selectedScholarship) {
            setForm(current => ({
              ...current,
              academicCategory:
                selectedScholarship.eligibleCategory || ""
            }));
          }
        }

        if (!selectedScholarship) {
          setError(
            "This PG scholarship is not available. Please select an active PG scholarship."
          );
        } else {
          setScholarship(selectedScholarship);
        }
      } catch (err) {
        console.error("Application loading error:", err);

        if (mounted) {
          setError(
            err.response?.data?.message ||
            "Unable to load your application information."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [scholarshipId, existingApplicationId]);

  // =======================================================
  // UPDATE FORM
  // =======================================================

  const updateForm = event => {
    const { name, value } = event.target;

    setForm(current => ({
      ...current,
      [name]: value
    }));
  };

  // =======================================================
  // UPDATE EDUCATION
  // =======================================================

  const updateEducation = (index, event) => {
    const { name, value } = event.target;

    setEducation(current =>
      current.map((item, i) =>
        i === index
          ? { ...item, [name]: value }
          : item
      )
    );
  };

  // =======================================================
  // FILE VALIDATION
  // =======================================================

  const chooseFile = (doc, file) => {
    if (!file) return;

    const isImageDocument = doc.imageOnly;

    const allowedMimeTypes = isImageDocument
      ? ["image/jpeg", "image/png"]
      : ["application/pdf"];

    const extension = file.name
      .split(".")
      .pop()
      .toLowerCase();

    const allowedExtensions = isImageDocument
      ? ["jpg", "jpeg", "png"]
      : ["pdf"];

    if (
      !allowedMimeTypes.includes(file.type) ||
      !allowedExtensions.includes(extension)
    ) {
      setError(
        isImageDocument
          ? `${doc.label} must be JPG, JPEG or PNG.`
          : `${doc.label} must be a PDF file only.`
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Each document must be 5 MB or smaller.");
      return;
    }

    setError("");
    setPreviewDocument(null);

    setFiles(current => ({
      ...current,
      [doc.type]: file
    }));
  };

  // =======================================================
  // PREVIEW DOCUMENT
  // Opens selected or previously uploaded document.
  // =======================================================

  const viewDocument = async doc => {
    setError("");
    setPreviewDocument(null);

    const selectedFile = files[doc.type];

    // Preview newly selected local file.

    if (selectedFile) {
      const objectUrl =
        window.URL.createObjectURL(selectedFile);

      setPreviewDocument({
        documentType: doc.type,
        name: selectedFile.name,
        type: selectedFile.type,
        url: objectUrl
      });

      return;
    }

    // Preview previously uploaded document.

    const existing = latestDocuments[doc.type];

    if (!existing) {
      setError("Please select a document before viewing it.");
      return;
    }

    setViewingDocument(doc.type);

    try {
      const response = await api.get(
        `/documents/${existing.id}/download`,
        { responseType: "blob" }
      );

      const headerType = response.headers?.["content-type"]
        ?.split(";")[0]
        ?.trim()
        ?.toLowerCase();

      const documentType =
        headerType && headerType !== "application/octet-stream"
          ? headerType
          : existing.contentType ||
            "application/octet-stream";

      const objectUrl = window.URL.createObjectURL(
        new Blob([response.data], {
          type: documentType
        })
      );

      setPreviewDocument({
        documentType: doc.type,
        name: existing.originalFileName || doc.label,
        type: documentType,
        url: objectUrl
      });
    } catch (err) {
      console.error("Document preview error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to preview this document. Please try again."
      );
    } finally {
      setViewingDocument(null);
    }
  };

  // =======================================================
  // FORM VALIDATION
  // =======================================================

  const validateForm = () => {
    if (!form.fatherName.trim()) {
      return "Please enter your father / guardian name.";
    }

    if (
      !form.annualFamilyIncome ||
      !Number.isFinite(Number(form.annualFamilyIncome)) ||
      Number(form.annualFamilyIncome) < 0
    ) {
      return "Please enter a valid annual family income.";
    }

    if (
      !form.accountHolderName.trim() ||
      !form.bankName.trim() ||
      !form.branchName.trim()
    ) {
      return "Please complete the account holder, bank and branch information.";
    }

    if (
      !isCorrectionMode &&
      (
        !form.accountNumber.trim() ||
        !form.ifscCode.trim()
      )
    ) {
      return "Please enter your account number and IFSC code.";
    }

    if (
      !form.scholarshipReason.trim() ||
      !form.currentCourse.trim() ||
      !form.collegeName.trim() ||
      !form.currentYear
    ) {
      return "Please complete your scholarship reason and current PG course information.";
    }

    if (!form.academicCategory.trim()) {
      return "Please select your academic category.";
    }

    // VALIDATE ONLY 10TH, 12TH AND GRADUATION

    const missingEducation =
      REQUIRED_EDUCATION_LEVELS.filter(level => {
        const record = education.find(
          item => item.educationLevel === level.value
        );

        if (
          !record ||
          !record.institutionName.trim()
        ) {
          return true;
        }

        if (!record.passingYear) {
          return true;
        }

        return false;
      });

    if (missingEducation.length > 0) {
      return (
        "Please complete these education details: " +
        missingEducation.map(item => item.label).join(", ")
      );
    }

    // VALIDATE REQUIRED DOCUMENTS

    const missingDocuments =
      REQUIRED_DOCUMENTS.filter(doc => {
        const existing = latestDocuments[doc.type];

        if (existing?.reviewedAt && !existing.verified) {
          return !files[doc.type];
        }

        return !existing && !files[doc.type];
      });

    if (missingDocuments.length > 0) {
      return (
        "Please upload the required documents: " +
        missingDocuments.map(doc => doc.label).join(", ")
      );
    }

    if (!declaration) {
      return "Please accept the declaration before submitting.";
    }

    return "";
  };

  // =======================================================
  // BUILD APPLICATION PAYLOAD
  // =======================================================

  const buildPayload = () => ({
    scholarshipId: Number(scholarship.id),

    scholarshipReason:
      form.scholarshipReason.trim(),

    handicapped:
      form.handicapped === "true",

    fatherName:
      form.fatherName.trim(),

    fatherOccupation:
      form.fatherOccupation,

    fatherMobileNumber:
      form.fatherMobileNumber,

    motherName:
      form.motherName.trim(),

    motherOccupation:
      form.motherOccupation,

    motherMobileNumber:
      form.motherMobileNumber,

    annualFamilyIncome:
      Number(form.annualFamilyIncome),

    accountHolderName:
      form.accountHolderName.trim(),

    bankName:
      form.bankName.trim(),

    branchName:
      form.branchName.trim(),

    accountNumber:
      form.accountNumber.trim(),

    ifscCode:
      form.ifscCode.trim().toUpperCase(),

    // Current PG details are stored separately.

    currentCourse:
      form.currentCourse.trim(),

    collegeName:
      form.collegeName.trim(),

    currentYear:
      Number(form.currentYear),

    academicCategory:
      form.academicCategory,

    // Only completed education records are sent.

    education: education
      .filter(item =>
        REQUIRED_EDUCATION_LEVELS.some(
          level => level.value === item.educationLevel
        )
      )
      .map(item => ({
        educationLevel:
          item.educationLevel,

        institutionName:
          item.institutionName.trim(),

        boardOrUniversity:
          item.boardOrUniversity,

        passingYear:
          item.passingYear
            ? Number(item.passingYear)
            : null,

        percentage:
          item.percentage
            ? Number(item.percentage)
            : null,

        cgpa:
          item.cgpa
            ? Number(item.cgpa)
            : null,

        seatOrRollNumber:
          item.seatOrRollNumber
      }))
  });

  // =======================================================
  // UPLOAD SELECTED DOCUMENTS
  // =======================================================

  const uploadSelectedFiles = async id => {
    for (const [documentType, file] of Object.entries(files)) {
      const data = new FormData();

      data.append("documentType", documentType);
      data.append("file", file);

      await api.post(
        `/documents/upload/${id}`,
        data
      );
    }
  };

  // =======================================================
  // SUBMIT APPLICATION
  // =======================================================

  const handleSubmit = async event => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();

      let savedApplication;

      if (applicationId) {
        const response = await api.put(
          `/applications/${applicationId}`,
          payload
        );

        savedApplication = response.data;
      } else {
        const response = await api.post(
          "/applications",
          payload
        );

        savedApplication = response.data;

        setApplicationId(savedApplication.id);
      }

      // Upload selected files and replacements.

      await uploadSelectedFiles(savedApplication.id);

      // Submit only after uploads complete.

      await api.post(
        `/applications/${savedApplication.id}/submit`
      );

      setSuccess(
        isCorrectionMode
          ? "Your corrected application has been resubmitted successfully."
          : "Your scholarship application has been submitted successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      setTimeout(() => {
        navigate("/student/applications");
      }, 1500);
    } catch (err) {
      console.error("Application submission error:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to submit your application. Please check your information and try again."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =======================================================
  // RENDER DOCUMENT ROW
  // =======================================================

  const renderDocument = (doc, required) => {
    const existing = latestDocuments[doc.type];

    const selectedFile = files[doc.type];

    const rejected =
      existing?.reviewedAt && !existing.verified;

    const status = documentStatus(existing);

    const isViewing =
      viewingDocument === doc.type;

    return (
      <div
        className="sc-document-entry"
        key={doc.type}
      >
        <div className="sc-document-row">

          <div className="sc-document-icon">
            <FileText size={21} />
          </div>

          <div className="sc-document-info">

            <strong>{doc.label}</strong>

            <small>
              {required
                ? "Required document"
                : "Optional document"}
            </small>

            <small className="sc-document-format">
              {doc.imageOnly
                ? "Accepted format: JPG, JPEG, PNG"
                : "Accepted format: PDF only"}
            </small>

            {existing && (
              <>
                <small>
                  Existing file: {existing.originalFileName}
                </small>

                <span
                  className={
                    existing.verified
                      ? "sc-document-status verified"
                      : rejected
                      ? "sc-document-status rejected"
                      : "sc-document-status pending"
                  }
                >
                  {existing.verified ? (
                    <CheckCircle size={14} />
                  ) : rejected ? (
                    <XCircle size={14} />
                  ) : (
                    <Clock size={14} />
                  )}

                  {status}
                </span>

                {existing.verificationRemark && (
                  <small className="sc-document-remark">
                    Admin remark: {existing.verificationRemark}
                  </small>
                )}
              </>
            )}

            {selectedFile && (
              <span className="sc-file-name">
                <CheckCircle size={14} />
                Selected: {selectedFile.name}
              </span>
            )}

          </div>

          <div className="sc-document-actions">

            <label className="sc-upload-button">
              <Upload size={16} />

              {selectedFile
                ? "Change File"
                : existing
                ? "Replace"
                : "Upload"}

              <input
                type="file"
                accept={getDocumentAccept(doc)}
                hidden
                disabled={submitting}
                onChange={event => {
                  chooseFile(
                    doc,
                    event.target.files?.[0]
                  );

                  event.target.value = "";
                }}
              />
            </label>

            {(selectedFile || existing) && (
              <button
                type="button"
                className="sc-document-view-button"
                disabled={isViewing}
                onClick={() => viewDocument(doc)}
              >
                {isViewing ? (
                  <>
                    <Clock size={15} />
                    Loading...
                  </>
                ) : (
                  <>
                    <Eye size={15} />
                    View
                  </>
                )}
              </button>
            )}

          </div>
        </div>
      </div>
    );
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="student-layout">
        <StudentSidebar />

        <main className="student-main">
          <div className="sc-loading">
            Loading your application form...
          </div>
        </main>
      </div>
    );
  }

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <div className="student-layout">

      <StudentSidebar />

      <main className="student-main sc-application-main">

        <button
          className="sc-back-button"
          type="button"
          onClick={() => navigate("/student/applications")}
        >
          <ArrowLeft size={17} />
          Back to My Applications
        </button>

        {/* PAGE HEADING */}

        <div className="sc-page-heading">
          <div>
            <span className="sc-eyebrow">
              SCHOLARCONNECT / PG APPLICATION
            </span>

            <h1>
              {isCorrectionMode
                ? "Correct Your Application"
                : "PG Scholarship Application"}
            </h1>

            <p>
              Complete all sections and submit your application for review.
            </p>
          </div>

          <div className="sc-heading-icon">
            <GraduationCap size={34} />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="sc-alert sc-alert-error">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="sc-alert sc-alert-success">
            <CheckCircle size={19} />
            {success}
          </div>
        )}

        {/* CORRECTION MESSAGE */}

        {isCorrectionMode && (
          <div className="sc-correction-instructions">
            <div className="sc-correction-instructions-icon">
              <MessageSquare size={22} />
            </div>

            <div>
              <strong>Admin requested corrections</strong>

              <p>
                {latestReviewRemarks ||
                  "Please review your application and update the information or documents that need correction."}
              </p>

              <small>
                Application ID: {applicationId}
              </small>
            </div>
          </div>
        )}

        {!scholarship ? (
          <div className="sc-card">
            The selected PG scholarship could not be loaded.
            Return to Browse Scholarships.
          </div>
        ) : (
          <>
            {/* SCHOLARSHIP BANNER */}

            <div className="sc-scholarship-banner">
              <div>
                <span>YOU ARE APPLYING FOR</span>

                <h2>{scholarship.name}</h2>

                <p>
                  {scholarship.description ||
                    "Postgraduate scholarship scheme"}
                </p>
              </div>

              <div className="sc-award">
                <small>AWARD AMOUNT</small>

                <strong>
                  {scholarship.awardAmount != null
                    ? `₹${Number(
                        scholarship.awardAmount
                      ).toLocaleString("en-IN")}`
                    : "As per scheme"}
                </strong>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              {/* 01 PERSONAL INFORMATION */}

              <Section
                number="01"
                title="Personal Information"
                description="Your registered account information is filled automatically."
              >
                <div className="sc-grid">

                  <Field label="Full Name">
                    <input
                      value={profile?.fullName || ""}
                      readOnly
                    />
                  </Field>

                  <Field label="Email Address">
                    <input
                      value={profile?.email || ""}
                      readOnly
                    />
                  </Field>

                  <Field label="Date of Birth">
                    <input
                      value={profile?.dateOfBirth || ""}
                      readOnly
                    />
                  </Field>

                  <Field label="Gender">
                    <input
                      value={profile?.gender || ""}
                      readOnly
                    />
                  </Field>

                  <Field label="Mobile Number">
                    <input
                      value={profile?.mobileNumber || ""}
                      readOnly
                    />
                  </Field>

                  <Field
                    label="Are you a person with disability?"
                    required
                  >
                    <select
                      name="handicapped"
                      value={form.handicapped}
                      onChange={updateForm}
                      required
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </Field>

                  <Field label="Academic Category" required>
                    <select
                      name="academicCategory"
                      value={form.academicCategory}
                      onChange={updateForm}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="OPEN">OPEN</option>
                      <option value="EWS">EWS</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="VJNT / NT">VJNT / NT</option>
                      <option value="SBC">SBC</option>
                      <option value="MINORITY">MINORITY</option>
                    </select>
                  </Field>

                </div>
              </Section>

              {/* 02 FAMILY INFORMATION */}

              <Section
                number="02"
                title="Family Information"
                description="Father / guardian name is required. Mother's information is optional."
              >
                <div className="sc-grid">

                  <Field
                    label="Father / Guardian Name"
                    required
                  >
                    <input
                      name="fatherName"
                      value={form.fatherName}
                      onChange={updateForm}
                      required
                    />
                  </Field>

                  <Field label="Father's Occupation">
                    <select
                      name="fatherOccupation"
                      value={form.fatherOccupation}
                      onChange={updateForm}
                    >
                      <option value="">Select occupation</option>

                      {[
                        "Farmer",
                        "Private Job",
                        "Government Job",
                        "Business",
                        "Self Employed",
                        "Labour",
                        "Unemployed",
                        "Other"
                      ].map(x => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Father's Mobile Number">
                    <input
                      name="fatherMobileNumber"
                      value={form.fatherMobileNumber}
                      onChange={updateForm}
                      maxLength="15"
                    />
                  </Field>

                  <Field label="Mother's Name">
                    <input
                      name="motherName"
                      value={form.motherName}
                      onChange={updateForm}
                      placeholder="Optional"
                    />
                  </Field>

                  <Field label="Mother's Occupation">
                    <select
                      name="motherOccupation"
                      value={form.motherOccupation}
                      onChange={updateForm}
                    >
                      <option value="">Select occupation</option>

                      {[
                        "Housewife",
                        "Farmer",
                        "Private Job",
                        "Government Job",
                        "Business",
                        "Self Employed",
                        "Labour",
                        "Other"
                      ].map(x => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Mother's Mobile Number">
                    <input
                      name="motherMobileNumber"
                      value={form.motherMobileNumber}
                      onChange={updateForm}
                      maxLength="15"
                    />
                  </Field>

                  <Field
                    label="Annual Family Income (₹)"
                    required
                  >
                    <input
                      type="number"
                      min="0"
                      name="annualFamilyIncome"
                      value={form.annualFamilyIncome}
                      onChange={updateForm}
                      required
                    />
                  </Field>

                </div>
              </Section>

              {/* 03 EDUCATION DETAILS */}

              <Section
                number="03"
                title="Education Details"
                description="Enter your completed 10th, 12th and graduation details."
              >

                {education.map((item, index) => {
                  const level = REQUIRED_EDUCATION_LEVELS[index];

                  return (
                    <div
                      className="sc-education-card"
                      key={item.educationLevel}
                    >
                      <div className="sc-education-title">
                        <strong>{level.label}</strong>
                      </div>

                      <div className="sc-grid">

                        <Field label="Education Level" required>
                          <input
                            value={level.label}
                            readOnly
                          />
                        </Field>

                        <Field
                          label="Institution Name"
                          required
                        >
                          <input
                            name="institutionName"
                            value={item.institutionName}
                            onChange={e =>
                              updateEducation(index, e)
                            }
                            required
                          />
                        </Field>

                        <Field label="Board / University">
                          <input
                            name="boardOrUniversity"
                            value={item.boardOrUniversity}
                            onChange={e =>
                              updateEducation(index, e)
                            }
                          />
                        </Field>

                        <Field label="Passing Year" required>
                          <input
                            type="number"
                            min="1950"
                            max="2100"
                            name="passingYear"
                            value={item.passingYear}
                            onChange={e =>
                              updateEducation(index, e)
                            }
                            required
                          />
                        </Field>

                        <Field label="Percentage">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            name="percentage"
                            value={item.percentage}
                            onChange={e =>
                              updateEducation(index, e)
                            }
                          />
                        </Field>

                        <Field label="CGPA">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            name="cgpa"
                            value={item.cgpa}
                            onChange={e =>
                              updateEducation(index, e)
                            }
                          />
                        </Field>

                        <Field label="Seat / Roll Number">
                          <input
                            name="seatOrRollNumber"
                            value={item.seatOrRollNumber}
                            onChange={e =>
                              updateEducation(index, e)
                            }
                          />
                        </Field>

                      </div>
                    </div>
                  );
                })}

                {/* CURRENT PG COURSE - SEPARATE SECTION */}

                <div className="sc-current-study">

                  <div className="sc-education-title">
                    <strong>Current PG Course</strong>
                  </div>

                  <div className="sc-grid">

                    <Field
                      label="Current PG Course"
                      required
                    >
                      <input
                        name="currentCourse"
                        value={form.currentCourse}
                        onChange={updateForm}
                        placeholder="e.g. MCA"
                        required
                      />
                    </Field>

                    <Field
                      label="Current College Name"
                      required
                    >
                      <input
                        name="collegeName"
                        value={form.collegeName}
                        onChange={updateForm}
                        required
                      />
                    </Field>

                    <Field
                      label="Current Year / Semester"
                      required
                    >
                      <input
                        name="currentYear"
                        type="number"
                        min="1"
                        max="10"
                        value={form.currentYear}
                        onChange={updateForm}
                        placeholder="e.g. 3"
                        required
                      />
                    </Field>

                  </div>
                </div>

              </Section>

              {/* 04 BANK INFORMATION */}

              <Section
                number="04"
                title="Bank Information"
                description="Your saved account number and IFSC are protected. Leave these blank during correction to keep existing values."
              >
                <div className="sc-grid">

                  <Field
                    label="Account Holder Name"
                    required
                  >
                    <input
                      name="accountHolderName"
                      value={form.accountHolderName}
                      onChange={updateForm}
                      required
                    />
                  </Field>

                  <Field label="Bank Name" required>
                    <input
                      name="bankName"
                      value={form.bankName}
                      onChange={updateForm}
                      required
                    />
                  </Field>

                  <Field label="Branch Name" required>
                    <input
                      name="branchName"
                      value={form.branchName}
                      onChange={updateForm}
                      required
                    />
                  </Field>

                  <Field label="Account Number">
                    <input
                      name="accountNumber"
                      type="password"
                      autoComplete="off"
                      value={form.accountNumber}
                      onChange={updateForm}
                      placeholder={
                        isCorrectionMode
                          ? "Leave blank to keep saved account number"
                          : "Enter account number"
                      }
                      required={!isCorrectionMode}
                    />
                  </Field>

                  <Field label="IFSC Code">
                    <input
                      name="ifscCode"
                      value={form.ifscCode}
                      onChange={updateForm}
                      maxLength="11"
                      placeholder={
                        isCorrectionMode
                          ? "Leave blank to keep saved IFSC"
                          : "Enter IFSC code"
                      }
                      style={{
                        textTransform: "uppercase"
                      }}
                      required={!isCorrectionMode}
                    />
                  </Field>

                </div>
              </Section>

              {/* 05 SCHOLARSHIP INFORMATION */}

              <Section
                number="05"
                title="Scholarship Information"
                description="Explain why you are applying for this postgraduate scholarship."
              >
                <Field
                  label="Scholarship Reason"
                  required
                >
                  <textarea
                    name="scholarshipReason"
                    rows="5"
                    maxLength="2000"
                    value={form.scholarshipReason}
                    onChange={updateForm}
                    placeholder="Explain your educational goals and why you need this scholarship..."
                    required
                  />
                </Field>
              </Section>

              {/* 06 REQUIRED DOCUMENTS */}

              <Section
                number="06"
                title="Required Documents"
                description="Photograph and signature: JPG/JPEG/PNG only. All other required documents: PDF only. Maximum 5 MB per file."
              >
                <div className="sc-document-list">
                  {REQUIRED_DOCUMENTS.map(doc =>
                    renderDocument(doc, true)
                  )}
                </div>

                <p className="sc-upload-progress">
                  {requiredUploaded} of {REQUIRED_DOCUMENTS.length}
                  {" "}required documents available
                </p>
              </Section>

              {/* 07 OPTIONAL DOCUMENTS */}

              <Section
                number="07"
                title="Optional Documents"
                description="Additional supporting documents. PDF only, maximum 5 MB per file."
              >
                <div className="sc-document-list">
                  {OPTIONAL_DOCUMENTS.map(doc =>
                    renderDocument(doc, false)
                  )}
                </div>
              </Section>

              {/* DECLARATION */}

              <div className="sc-declaration">
                <label>
                  <input
                    type="checkbox"
                    checked={declaration}
                    onChange={e =>
                      setDeclaration(e.target.checked)
                    }
                  />

                  <span>
                    I confirm that the information and documents
                    provided by me are true and correct. I understand
                    that incorrect information may result in rejection
                    of my scholarship application.
                  </span>
                </label>
              </div>

              {/* SUBMIT */}

              <div className="sc-submit-footer">

                <div>
                  <strong>
                    {isCorrectionMode
                      ? "Ready to resubmit?"
                      : "Ready to submit?"}
                  </strong>

                  <p>
                    {isCorrectionMode
                      ? "Your corrected information will be sent to the admin for another review."
                      : "Your application will be sent to the admin for review."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : isCorrectionMode
                    ? "Resubmit Corrected Application"
                    : "Submit Application"}

                  <Send size={17} />
                </button>

              </div>

            </form>
          </>
        )}

      </main>

      {/* DOCUMENT PREVIEW POPUP
          Rendered outside the application form. */}

      <DocumentPreviewModal
        document={previewDocument}
        onClose={closeDocumentPreview}
      />

    </div>
  );
}