import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Download,
  FileText,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Edit3
} from "lucide-react";

import { Link } from "react-router-dom";

import StudentSidebar from "../../components/StudentSidebar";
import api from "../../services/api";

import "../../styles/MyApplications.css";

const getStatusLabel = status => {
  switch (status) {
    case "SUBMITTED":
    case "UNDER_REVIEW":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "CORRECTION_REQUESTED":
      return "Correction Required";
    case "DRAFT":
      return "Draft";
    default:
      return "Unknown";
  }
};

function Status({ value }) {
  const statusClass = {
    SUBMITTED: "pending",
    UNDER_REVIEW: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    CORRECTION_REQUESTED: "correction",
    DRAFT: "unknown"
  }[value] || "unknown";

  return (
    <span className={`sc-status sc-status-${statusClass}`}>
      {getStatusLabel(value)}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function MyApplications() {

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);

  // LOAD APPLICATIONS
  const load = useCallback(async () => {

    setLoading(true);
    setError("");

    try {

      const response = await api.get("/applications/my");

      setApplications(
        Array.isArray(response.data) ? response.data : []
      );

    } catch (err) {

      console.error("My applications loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load your applications. Please try again."
      );

    } finally {
      setLoading(false);
    }

  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Keep drafts hidden.
  const visibleApplications = useMemo(
    () => applications.filter(app => app.status !== "DRAFT"),
    [applications]
  );

  // APPLICATION COUNTS
  const counts = useMemo(() => ({

    total: visibleApplications.length,

    pending: visibleApplications.filter(app =>
      ["SUBMITTED", "UNDER_REVIEW"].includes(app.status)
    ).length,

    approved: visibleApplications.filter(
      app => app.status === "APPROVED"
    ).length,

    rejected: visibleApplications.filter(
      app => app.status === "REJECTED"
    ).length,

    correction: visibleApplications.filter(
      app => app.status === "CORRECTION_REQUESTED"
    ).length

  }), [visibleApplications]);

  // DOWNLOAD APPLICATION PDF
  const downloadPdf = async app => {

    try {

      setDownloading(app.id);
      setError("");

      const response = await api.get(
        `/applications/${app.id}/pdf`,
        {
          responseType: "blob",
          headers: {
            Accept: "*/*"
          }
        }
      );

      // Check whether the server returned an actual PDF.
      const contentType =
        response.headers?.["content-type"] || "";

      if (
        contentType &&
        !contentType.toLowerCase().includes("application/pdf")
      ) {
        throw new Error(
          "The server did not return a PDF file. Please try again."
        );
      }

      const pdfBlob = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      if (pdfBlob.size === 0) {
        throw new Error("The generated PDF file is empty.");
      }

      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");

      link.href = url;

      link.download =
        `${app.applicationNumber || "Application"}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Revoke after the browser has started the download.
      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (err) {

      console.error("Application PDF download error:", err);

      let message =
        "Unable to download application PDF. Please try again.";

      if (err.response?.status === 406) {
        message =
          "The server cannot return the PDF in the requested format. Please contact support.";
      } else if (err.response?.status === 401) {
        message =
          "Your session has expired. Please sign in again.";
      } else if (err.response?.status === 403) {
        message =
          "You do not have permission to download this application PDF.";
      } else if (err.message) {
        message = err.message;
      }

      setError(message);

    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="student-layout">

      <StudentSidebar />

      <main className="student-main sc-application-main">

        {/* PAGE HEADING */}
        <div className="sc-page-heading">

          <div>
            <span className="sc-eyebrow">STUDENT PORTAL</span>
            <h1>My Applications</h1>
            <p>
              Track your scholarship applications and admin decisions.
            </p>
          </div>

          <button
            className="sc-refresh"
            type="button"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        {/* SUMMARY CARDS */}
        <div className="sc-summary-grid">

          <div className="sc-summary-card">
            <FileText />
            <div>
              <span>Total Applications</span>
              <strong>{counts.total}</strong>
            </div>
          </div>

          <div className="sc-summary-card">
            <Clock />
            <div>
              <span>Pending</span>
              <strong>{counts.pending}</strong>
            </div>
          </div>

          <div className="sc-summary-card">
            <CheckCircle />
            <div>
              <span>Approved</span>
              <strong>{counts.approved}</strong>
            </div>
          </div>

          <div className="sc-summary-card">
            <XCircle />
            <div>
              <span>Rejected</span>
              <strong>{counts.rejected}</strong>
            </div>
          </div>

          <div className="sc-summary-card">
            <MessageSquare />
            <div>
              <span>Correction Required</span>
              <strong>{counts.correction}</strong>
            </div>
          </div>

        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="sc-alert sc-alert-error" role="alert">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {/* APPLICATION HISTORY */}
        <section className="sc-card">

          <div className="sc-card-title">
            <div>
              <h2>Application History</h2>
              <p>
                Your application status is updated after admin review.
              </p>
            </div>
          </div>

          {loading ? (

            <div className="sc-loading">
              Loading your applications...
            </div>

          ) : visibleApplications.length === 0 ? (

            <div className="sc-empty">
              <FileText size={45} />

              <h3>No applications submitted yet</h3>

              <p>
                Browse available scholarships and submit your first application.
              </p>

              <Link
                to="/student/scholarships"
                className="sc-primary-link"
              >
                Browse Scholarships
              </Link>
            </div>

          ) : (

            <div className="sc-table-wrap">

              <table className="sc-table">

                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Scholarship</th>
                    <th>Submitted On</th>
                    <th>Status</th>
                    <th>Action</th>
                    <th>Download</th>
                  </tr>
                </thead>

                <tbody>

                  {visibleApplications.map(app => (

                    <React.Fragment key={app.id}>

                      <tr>

                        <td>
                          <strong>
                            {app.applicationNumber || "-"}
                          </strong>

                          <small>
                            {app.currentCourse || "PG Student"}
                          </small>
                        </td>

                        <td>
                          {app.scholarship?.name || "Scholarship"}
                        </td>

                        <td>
                          {formatDate(app.submittedAt)}
                        </td>

                        <td>
                          <Status value={app.status} />
                        </td>

                        <td>
                          {app.status === "CORRECTION_REQUESTED" ? (

                            <Link
                              className="sc-edit-resubmit-button"
                              to={`/student/apply/${app.scholarship?.id}?applicationId=${app.id}`}
                            >
                              <Edit3 size={15} />
                              Edit & Resubmit
                            </Link>

                          ) : (
                            <span className="sc-muted">—</span>
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="sc-download-button"
                            disabled={downloading === app.id}
                            onClick={() => downloadPdf(app)}
                          >
                            <Download size={16} />

                            {downloading === app.id
                              ? "Downloading..."
                              : "PDF"}
                          </button>
                        </td>

                      </tr>

                      {app.status === "CORRECTION_REQUESTED" && (

                        <tr className="sc-correction-remark-row">

                          <td colSpan="6">

                            <div className="sc-correction-remark">

                              <div className="sc-correction-remark-icon">
                                <MessageSquare size={19} />
                              </div>

                              <div>
                                <strong>
                                  Admin Correction Remarks
                                </strong>

                                <p>
                                  {app.latestReviewRemarks ||
                                    "The admin has requested corrections. Please open your application and review the required changes."}
                                </p>
                              </div>

                            </div>

                          </td>

                        </tr>

                      )}

                    </React.Fragment>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* STATUS INFORMATION */}
        {visibleApplications.length > 0 && (

          <section className="sc-card">

            <h3>Understanding Your Application Status</h3>

            <div className="sc-document-list">

              <div className="sc-document-row">
                <Clock size={20} />

                <div className="sc-document-info">
                  <strong>Pending</strong>
                  <small>
                    Your application has been submitted and is awaiting admin review.
                  </small>
                </div>
              </div>

              <div className="sc-document-row">
                <CheckCircle size={20} />

                <div className="sc-document-info">
                  <strong>Approved</strong>
                  <small>
                    Your scholarship application has been approved.
                  </small>
                </div>
              </div>

              <div className="sc-document-row">
                <XCircle size={20} />

                <div className="sc-document-info">
                  <strong>Rejected</strong>
                  <small>
                    Your application has been rejected. Check the admin remarks.
                  </small>
                </div>
              </div>

              <div className="sc-document-row">
                <MessageSquare size={20} />

                <div className="sc-document-info">
                  <strong>Correction Required</strong>
                  <small>
                    Open Edit & Resubmit, correct the requested information,
                    and submit the application again.
                  </small>
                </div>
              </div>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}