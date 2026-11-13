import React, { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

import {
  Users,
  FileText,
  GraduationCap,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  X,
  AlertCircle,
  User,
  BookOpen,
  Landmark,
  Paperclip,
  Download
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import "../../styles/Applications.css";

// =====================================================
// HELPERS
// =====================================================

const pretty = value => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

function formatResult(row) {
  if (row.percentage !== null && row.percentage !== undefined) {
    return `${row.percentage}%`;
  }

  if (row.cgpa !== null && row.cgpa !== undefined) {
    return `${row.cgpa} CGPA`;
  }

  return "-";
}

function Status({ value }) {
  const css = (value || "unknown")
    .toLowerCase()
    .replaceAll("_", "-");

  return (
    <span className={`sc-status sc-status-${css}`}>
      {pretty(value).replaceAll("_", " ")}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function Detail({ label, value }) {
  return (
    <div className="sc-detail-item">
      <span>{label}</span>
      <strong>{pretty(value)}</strong>
    </div>
  );
}

function ModalSection({ icon: Icon, title, children }) {
  return (
    <section className="sc-review-section">
      <h3>
        {Icon && <Icon size={19} />}
        {title}
      </h3>
      {children}
    </section>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Applications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);

  const [action, setAction] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [documentError, setDocumentError] = useState("");

  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  // ===================================================
  // LOAD APPLICATIONS
  // ===================================================

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/applications");

      setApplications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Applications loading error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Please log in using an Admin account.");
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to load applications."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // ===================================================
  // DOCUMENT URL CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      if (documentPreview?.url) {
        window.URL.revokeObjectURL(documentPreview.url);
      }
    };
  }, [documentPreview]);

  // ===================================================
  // CLOSE APPLICATION
  // ===================================================

  const closeApplication = () => {
    setDocumentPreview(null);
    setDocumentError("");
    setDocuments([]);
    setSelected(null);
    setAction("");
    setRemarks("");
  };

  // ===================================================
  // OPEN APPLICATION DETAILS
  // ===================================================

  const openApplication = async app => {
    setError("");
    setSelected(app);
    setDocuments([]);
    setDocumentPreview(null);
    setDocumentError("");
    setLoadingDetails(true);

    try {
      const [detailResponse, documentResponse] =
        await Promise.all([
          api.get(`/admin/applications/${app.id}`),
          api.get(`/admin/documents/application/${app.id}`)
        ]);

      setSelected(detailResponse.data);

      setDocuments(
        Array.isArray(documentResponse.data)
          ? documentResponse.data
          : []
      );
    } catch (err) {
      console.error("Application detail error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load application details."
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  // ===================================================
  // DOCUMENT PREVIEW
  // ===================================================

  const viewDocument = async doc => {
    setViewingDocument(doc.id);
    setDocumentError("");

    try {
      const response = await api.get(
        `/admin/documents/${doc.id}/download`,
        { responseType: "blob" }
      );

      const responseType =
        response.headers?.["content-type"]
          ?.split(";")[0]
          ?.trim()
          ?.toLowerCase();

      const contentType =
        responseType &&
        responseType !== "application/octet-stream"
          ? responseType
          : doc.contentType || "application/octet-stream";

      const blob = new Blob(
        [response.data],
        { type: contentType }
      );

      const objectUrl = window.URL.createObjectURL(blob);

      setDocumentPreview(previous => {
        if (previous?.url) {
          window.URL.revokeObjectURL(previous.url);
        }

        return {
          id: doc.id,
          name: doc.originalFileName || doc.documentType,
          type: contentType,
          url: objectUrl
        };
      });
    } catch (err) {
      console.error("Document preview error:", err);

      setDocumentError(
        err.response?.data?.message ||
        "Unable to preview this document. Please try again."
      );
    } finally {
      setViewingDocument(null);
    }
  };

  const closeDocumentPreview = () => {
    setDocumentPreview(null);
    setDocumentError("");
  };

  // ===================================================
  // DOWNLOAD DOCUMENT
  // ===================================================

  const downloadPreviewDocument = () => {
    if (!documentPreview?.url) return;

    const link = window.document.createElement("a");

    link.href = documentPreview.url;
    link.download = documentPreview.name || "document";
    link.style.display = "none";

    window.document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // ===================================================
  // ADMIN DECISION
  // ===================================================

  const runAction = async () => {
    if (!selected || !action || !remarks.trim()) {
      setError("Please enter review remarks.");
      return;
    }

    const endpoints = {
      APPROVE: "approve",
      REJECT: "reject",
      CORRECTION: "request-correction"
    };

    setBusy(true);
    setError("");

    try {
      await api.put(
        `/admin/applications/${selected.id}/${endpoints[action]}`,
        { remarks: remarks.trim() }
      );

      setAction("");
      setRemarks("");

      await loadApplications();

      const updated = await api.get(
        `/admin/applications/${selected.id}`
      );

      setSelected(updated.data);
    } catch (err) {
      console.error("Application review error:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to update application status."
      );
    } finally {
      setBusy(false);
    }
  };

  // ===================================================
  // FILTERS AND DERIVED VALUES
  // ===================================================

  const visible = applications.filter(app =>
    app.status !== "DRAFT" &&
    (filter === "ALL" || app.status === filter)
  );

  const education = selected?.education || [];

  const isPdf =
    documentPreview?.type === "application/pdf";

  const isImage =
    documentPreview?.type?.startsWith("image/");

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}

      <AdminSidebar activePage="applications" variant="admin" />

      {/* MAIN CONTENT */}

      <main className="admin-main">

        <header className="admin-topbar">

          <div>
            <h1>Scholarship Applications</h1>
            <p>
              Review student applications and manage scholarship decisions.
            </p>
          </div>

          <div className="admin-user-info">

            <div className="admin-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <strong>{user?.fullName || "Administrator"}</strong>
              <span>Administrator</span>
            </div>

            <button
              type="button"
              className="admin-refresh"
              onClick={loadApplications}
              title="Refresh applications"
              disabled={loading}
            >
              <RefreshCw size={18} />
            </button>

          </div>

        </header>

        <section className="admin-welcome">

          <div>
            <span className="admin-welcome-tag">
              <FileText size={15} />
              APPLICATION MANAGEMENT
            </span>

            <h2>Scholarship Applications</h2>

            <p>
              View student information, uploaded documents
              and application decisions from one place.
            </p>
          </div>

          <div className="admin-welcome-icon">
            <FileText size={65} />
          </div>

        </section>

        {error && (
          <div className="admin-error">
            <AlertCircle size={20} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="admin-section-heading">
          <div>
            <h2>Application Overview</h2>
            <p>Total applications: {applications.length}</p>
          </div>
        </section>

        {/* STATISTICS */}

        <section className="admin-stats-grid">

          <div className="admin-stat-card">
            <div className="admin-stat-icon blue">
              <FileText size={23} />
            </div>
            <div className="admin-stat-details">
              <p>Total Applications</p>
              <h3>{applications.length}</h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon orange">
              <RefreshCw size={23} />
            </div>
            <div className="admin-stat-details">
              <p>Submitted / Under Review</p>
              <h3>
                {applications.filter(app =>
                  ["SUBMITTED", "UNDER_REVIEW"].includes(app.status)
                ).length}
              </h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon green">
              <CheckCircle size={23} />
            </div>
            <div className="admin-stat-details">
              <p>Approved Applications</p>
              <h3>
                {applications.filter(app =>
                  app.status === "APPROVED"
                ).length}
              </h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon red">
              <XCircle size={23} />
            </div>
            <div className="admin-stat-details">
              <p>Rejected Applications</p>
              <h3>
                {applications.filter(app =>
                  app.status === "REJECTED"
                ).length}
              </h3>
            </div>
          </div>

        </section>

        {/* FILTER */}

        <section className="sc-admin-filter">
          <label>Filter by status</label>

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="ALL">All Applications</option>
            <option value="SUBMITTED">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CORRECTION_REQUESTED">
              Correction Requested
            </option>
          </select>
        </section>

        {/* APPLICATION TABLE */}

        <section className="sc-card">

          {loading ? (

            <div className="sc-loading">
              Loading applications...
            </div>

          ) : visible.length === 0 ? (

            <div className="sc-empty">
              <FileText size={40} />
              <h3>No applications found</h3>
              <p>No applications match the selected status.</p>
            </div>

          ) : (

            <div className="sc-table-wrap">
              <table className="sc-table">

                <thead>
                  <tr>
                    <th>Application No.</th>
                    <th>Student</th>
                    <th>Scholarship</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Review</th>
                  </tr>
                </thead>

                <tbody>
                  {visible.map(app => (
                    <tr key={app.id}>

                      <td>
                        <strong>{app.applicationNumber}</strong>
                      </td>

                      <td>
                        {app.student?.fullName || "-"}
                        <small>{app.student?.email || "-"}</small>
                      </td>

                      <td>{app.scholarship?.name || "-"}</td>

                      <td>{formatDate(app.submittedAt)}</td>

                      <td>
                        <Status value={app.status} />
                      </td>

                      <td>
                        <button
                          type="button"
                          className="sc-download-button"
                          onClick={() => openApplication(app)}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </section>

        <footer className="admin-footer">
          © 2026 ScholarConnect. Scholarship Management Portal.
        </footer>

      </main>

      {/* APPLICATION DETAILS MODAL */}

      {selected && (

        <div
          className="sc-modal-backdrop"
          onClick={closeApplication}
        >

          <div
            className="sc-modal sc-admin-detail-modal sc-admin-review-modal"
            onClick={e => e.stopPropagation()}
          >

            <div className="sc-modal-header">

              <div>
                <span className="sc-eyebrow">APPLICATION REVIEW</span>
                <h2>{selected.applicationNumber}</h2>
              </div>

              <button
                type="button"
                onClick={closeApplication}
                className="sc-icon-button"
                aria-label="Close application"
              >
                <X />
              </button>

            </div>

            <div className="sc-modal-body">

              {loadingDetails ? (

                <div className="sc-loading">
                  <RefreshCw className="sc-spin" size={22} />
                  Loading complete application details...
                </div>

              ) : (

                <>

                  {/* PERSONAL INFORMATION */}

                  <ModalSection icon={User} title="Personal Information">

                    <div className="sc-detail-grid">

                      <Detail label="Full Name" value={selected.student?.fullName} />
                      <Detail label="Email" value={selected.student?.email} />
                      <Detail label="Mobile" value={selected.student?.mobileNumber} />
                      <Detail label="Date of Birth" value={selected.student?.dateOfBirth} />
                      <Detail label="Gender" value={selected.student?.gender} />

                      <Detail
                        label="Disability"
                        value={
                          selected.handicapped === true
                            ? "Yes"
                            : selected.handicapped === false
                              ? "No"
                              : "-"
                        }
                      />

                    </div>

                  </ModalSection>

                  {/* CURRENT EDUCATION */}

                  <ModalSection
                    icon={GraduationCap}
                    title="Current Education Information"
                  >

                    <div className="sc-detail-grid">
                      <Detail label="Current Course" value={selected.currentCourse} />
                      <Detail label="College" value={selected.collegeName} />
                      <Detail label="Current Year / Semester" value={selected.currentYear} />
                      <Detail label="Academic Category" value={selected.academicCategory} />
                    </div>

                  </ModalSection>

                  {/* PREVIOUS EDUCATION */}

                  <ModalSection
                    icon={BookOpen}
                    title="Previous Education Details"
                  >

                    {education.length > 0 ? (

                      <div className="sc-table-wrap sc-education-table-wrap">

                        <table className="sc-table sc-education-table">

                          <thead>
                            <tr>
                              <th>Level</th>
                              <th>Institution</th>
                              <th>Board / University</th>
                              <th>Passing Year</th>
                              <th>Result</th>
                            </tr>
                          </thead>

                          <tbody>

                            {education.map((row, index) => (

                              <tr
                                key={
                                  row.id ||
                                  `${row.educationLevel}-${row.passingYear}-${index}`
                                }
                              >
                                <td>
                                  <strong>{pretty(row.educationLevel)}</strong>
                                </td>

                                <td>{pretty(row.institutionName)}</td>

                                <td>{pretty(row.boardOrUniversity)}</td>

                                <td>{pretty(row.passingYear)}</td>

                                <td>
                                  <strong>{formatResult(row)}</strong>
                                </td>
                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    ) : (

                      <p className="sc-muted">
                        No previous education records were returned by the server.
                      </p>

                    )}

                  </ModalSection>

                  {/* FAMILY INFORMATION */}

                  <ModalSection icon={Users} title="Family Information">

                    <div className="sc-detail-grid">

                      <Detail label="Father / Guardian Name" value={selected.fatherName} />
                      <Detail label="Father Occupation" value={selected.fatherOccupation} />
                      <Detail label="Father Mobile" value={selected.fatherMobileNumber} />

                      <Detail label="Mother Name" value={selected.motherName} />
                      <Detail label="Mother Occupation" value={selected.motherOccupation} />
                      <Detail label="Mother Mobile" value={selected.motherMobileNumber} />

                      <Detail
                        label="Annual Family Income"
                        value={
                          selected.annualFamilyIncome != null
                            ? `₹ ${selected.annualFamilyIncome}`
                            : "-"
                        }
                      />

                    </div>

                  </ModalSection>

                  {/* BANK INFORMATION */}

                  <ModalSection icon={Landmark} title="Bank Information">

                    <div className="sc-detail-grid">

                      <Detail label="Account Holder" value={selected.accountHolderName} />
                      <Detail label="Bank" value={selected.bankName} />
                      <Detail label="Branch" value={selected.branchName} />

                      <Detail
                        label="Account Number"
                        value={selected.maskedAccountNumber}
                      />

                      <Detail
                        label="IFSC Code"
                        value={selected.ifscCode}
                      />

                    </div>

                    <p className="sc-muted sc-security-note">
                      The account number is masked for security.
                    </p>

                  </ModalSection>

                  {/* SCHOLARSHIP INFORMATION */}

                  <ModalSection
                    icon={GraduationCap}
                    title="Scholarship Information"
                  >

                    <div className="sc-detail-grid">

                      <Detail
                        label="Scholarship Name"
                        value={selected.scholarship?.name}
                      />

                      <Detail
                        label="Education Level"
                        value={selected.scholarship?.educationLevel}
                      />

                      <Detail
                        label="Eligible Category"
                        value={selected.scholarship?.eligibleCategory}
                      />

                      <Detail
                        label="Eligible Course"
                        value={selected.scholarship?.eligibleCourse}
                      />

                      <Detail
                        label="Award Amount"
                        value={
                          selected.scholarship?.awardAmount != null
                            ? `₹ ${selected.scholarship.awardAmount}`
                            : "-"
                        }
                      />

                    </div>

                    <div className="sc-scholarship-reason">

                      <h4>
                        <MessageSquare size={17} />
                        Student's Scholarship Reason
                      </h4>

                      <p>{pretty(selected.scholarshipReason)}</p>

                    </div>

                  </ModalSection>

                  {/* DOCUMENTS */}

                  <ModalSection icon={Paperclip} title="Uploaded Documents">

                    <p className="sc-muted">
                      Select View Document to preview a PDF or image in a popup.
                    </p>

                    {documents.length === 0 ? (

                      <p className="sc-muted">
                        No documents uploaded.
                      </p>

                    ) : (

                      <div className="sc-document-list">

                        {documents.map(doc => (

                          <div className="sc-document-row" key={doc.id}>

                            <FileText size={20} />

                            <div className="sc-document-info">

                              <strong>
                                {pretty(doc.documentType).replaceAll("_", " ")}
                              </strong>

                              <small>{pretty(doc.originalFileName)}</small>

                              <small>
                                {doc.verified
                                  ? "Verified"
                                  : doc.reviewedAt
                                    ? "Re-upload required"
                                    : "Uploaded - not yet verified"}
                              </small>

                            </div>

                            <button
                              type="button"
                              className="sc-view-document-button"
                              disabled={viewingDocument === doc.id}
                              onClick={() => viewDocument(doc)}
                            >
                              {viewingDocument === doc.id ? (
                                <>
                                  <RefreshCw size={15} className="sc-spin" />
                                  Opening...
                                </>
                              ) : (
                                <>
                                  <Eye size={15} />
                                  View Document
                                </>
                              )}
                            </button>

                          </div>

                        ))}

                      </div>

                    )}

                  </ModalSection>

                  {/* LATEST REVIEW REMARK */}

                  {selected.latestReviewRemarks && (
                    <div className="sc-review-remarks">
                      <h4>Latest Admin Review Remarks</h4>
                      <p>{selected.latestReviewRemarks}</p>
                    </div>
                  )}

                  {/* ADMIN DECISION */}

                  {["SUBMITTED", "UNDER_REVIEW"].includes(selected.status) && (

                    <div className="sc-admin-actions">

                      <h3>Final Decision</h3>

                      <p>
                        Review the application information and uploaded
                        documents before making a decision.
                      </p>

                      <div className="sc-action-buttons">

                        <button
                          type="button"
                          onClick={() => {
                            setAction("APPROVE");
                            setRemarks("");
                          }}
                          className="sc-approve-button"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAction("REJECT");
                            setRemarks("");
                          }}
                          className="sc-reject-button"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAction("CORRECTION");
                            setRemarks("");
                          }}
                          className="sc-correction-button"
                        >
                          <MessageSquare size={16} />
                          Request Correction
                        </button>

                      </div>

                    </div>

                  )}

                </>
              )}

            </div>

          </div>

        </div>

      )}

      {/* DOCUMENT PREVIEW POPUP */}

      {documentPreview && (

        <div
          className="sc-modal-backdrop sc-document-preview-backdrop"
          onClick={closeDocumentPreview}
        >

          <div
            className="sc-document-preview-modal"
            onClick={e => e.stopPropagation()}
          >

            <div className="sc-document-preview-header">

              <div className="sc-preview-title">
                <span>DOCUMENT PREVIEW</span>
                <h2>{documentPreview.name}</h2>
              </div>

              <div className="sc-document-preview-actions">

                <button
                  type="button"
                  className="sc-preview-download-button"
                  onClick={downloadPreviewDocument}
                  title="Download document"
                >
                  <Download size={19} />
                  <span>Download Document</span>
                </button>

                <button
                  type="button"
                  className="sc-preview-close-button"
                  onClick={closeDocumentPreview}
                  title="Close preview"
                  aria-label="Close document preview"
                >
                  <X size={21} />
                </button>

              </div>

            </div>

            <div className="sc-document-preview-content">

              {isPdf ? (

                <iframe
                  title="PDF Document Preview"
                  src={documentPreview.url}
                  className="sc-document-pdf-frame"
                />

              ) : isImage ? (

                <img
                  src={documentPreview.url}
                  alt={documentPreview.name}
                  className="sc-document-image-preview"
                />

              ) : (

                <div className="sc-document-unsupported">

                  <FileText size={45} />

                  <h3>Preview not available</h3>

                  <p>
                    This file type cannot be displayed in the preview.
                    You can download the document instead.
                  </p>

                  <button
                    type="button"
                    onClick={downloadPreviewDocument}
                  >
                    <Download size={17} />
                    Download Document
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

      {/* DOCUMENT ERROR */}

      {documentError && (
        <div className="admin-error sc-document-error">
          <AlertCircle size={19} />
          <span>{documentError}</span>
          <button
            type="button"
            onClick={() => setDocumentError("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* DECISION REMARKS MODAL */}

      {action && selected && (

        <div
          className="sc-modal-backdrop sc-action-backdrop"
          onClick={() => !busy && setAction("")}
        >

          <div
            className="sc-modal sc-action-modal"
            onClick={e => e.stopPropagation()}
          >

            <div className="sc-modal-header">

              <h2>
                {action === "APPROVE"
                  ? "Approve Application"
                  : action === "REJECT"
                    ? "Reject Application"
                    : "Request Correction"}
              </h2>

              <button
                type="button"
                className="sc-icon-button"
                onClick={() => setAction("")}
                disabled={busy}
              >
                <X />
              </button>

            </div>

            <div className="sc-modal-body">

              <label className="sc-field">
                <span>Review Remarks *</span>

                <textarea
                  rows="5"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Enter your review decision and remarks..."
                />
              </label>

              <div className="sc-action-buttons">

                <button
                  type="button"
                  className="sc-correction-button"
                  onClick={() => setAction("")}
                  disabled={busy}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="sc-approve-button"
                  disabled={busy || !remarks.trim()}
                  onClick={runAction}
                >
                  {busy ? "Saving..." : "Confirm Decision"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}