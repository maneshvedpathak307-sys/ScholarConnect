import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import AdminSidebar from "../../components/AdminSidebar";

import {
  GraduationCap,
  FileText,
  Search,
  Download,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  BarChart3
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import "../../styles/Reports.css";

// ------------------------------------------
// DATE FORMAT
// ------------------------------------------

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ------------------------------------------
// ERROR MESSAGE
// ------------------------------------------

function getErrorMessage(err) {
  const data = err.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.detail ||
    data?.message ||
    data?.error ||
    "Unable to process the report request."
  );
}

// ------------------------------------------
// MAIN COMPONENT
// ------------------------------------------

export default function Reports() {
  const { user } = useAuth();

  const [scholarships, setScholarships] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedScholarshipId, setSelectedScholarshipId] =
    useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [report, setReport] = useState(null);

  const [loadingScholarships, setLoadingScholarships] =
    useState(true);

  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ------------------------------------------
  // SELECTED SCHOLARSHIP
  // ------------------------------------------

  const selectedScholarship = useMemo(() => {
    return scholarships.find(
      scholarship =>
        String(scholarship.id) === selectedScholarshipId
    );
  }, [scholarships, selectedScholarshipId]);

  // ------------------------------------------
  // LOAD SCHOLARSHIPS
  // ------------------------------------------

  const fetchScholarships = useCallback(async () => {
    try {
      setError("");
      setSuccess("");

      const response = await api.get("/admin/scholarships");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setScholarships(data);

      if (data.length > 0) {
        const firstScholarship =
          data.find(item => item.active) || data[0];

        setSelectedScholarshipId(
          String(firstScholarship.id)
        );

        setFromDate(firstScholarship.startDate || "");
        setToDate(firstScholarship.endDate || "");
      } else {
        setSelectedScholarshipId("");
        setFromDate("");
        setToDate("");
      }

      setReport(null);

    } catch (err) {
      setError(getErrorMessage(err));

    } finally {
      setLoadingScholarships(false);
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  // ------------------------------------------
  // SEARCH SCHOLARSHIPS
  // ------------------------------------------

  const filteredScholarships = useMemo(() => {
    const query = search.trim().toLowerCase();

    return scholarships.filter(scholarship =>
      (scholarship.name || "")
        .toLowerCase()
        .includes(query)
    );
  }, [scholarships, search]);

  // ------------------------------------------
  // SELECT SCHOLARSHIP
  // ------------------------------------------

  const handleScholarshipChange = event => {
    const id = event.target.value;

    setSelectedScholarshipId(id);

    const scholarship = scholarships.find(
      item => String(item.id) === id
    );

    if (scholarship) {
      setFromDate(scholarship.startDate || "");
      setToDate(scholarship.endDate || "");
    } else {
      setFromDate("");
      setToDate("");
    }

    setReport(null);
    setError("");
    setSuccess("");
  };

  // ------------------------------------------
  // CHANGE REPORT DATES
  // ------------------------------------------

  const handleFromDateChange = event => {
    const value = event.target.value;

    setFromDate(value);
    setReport(null);
    setError("");
    setSuccess("");

    if (toDate && value > toDate) {
      setToDate("");
    }
  };

  const handleToDateChange = event => {
    const value = event.target.value;

    setToDate(value);
    setReport(null);
    setError("");
    setSuccess("");
  };

  // ------------------------------------------
  // VALIDATE REPORT DATES
  // ------------------------------------------

  const validateReportDates = () => {
    if (!selectedScholarship) {
      return "Please select a scholarship.";
    }

    const scholarshipStart = selectedScholarship.startDate;
    const scholarshipEnd = selectedScholarship.endDate;

    if (!scholarshipStart || !scholarshipEnd) {
      return (
        "This scholarship does not have a valid application period."
      );
    }

    if (!fromDate || !toDate) {
      return "Please select both report dates.";
    }

    if (fromDate > toDate) {
      return "From Date cannot be after To Date.";
    }

    if (
      fromDate < scholarshipStart ||
      fromDate > scholarshipEnd
    ) {
      return (
        `From Date must be between ${formatDate(scholarshipStart)} ` +
        `and ${formatDate(scholarshipEnd)}.`
      );
    }

    if (
      toDate < scholarshipStart ||
      toDate > scholarshipEnd
    ) {
      return (
        `To Date must be between ${formatDate(scholarshipStart)} ` +
        `and ${formatDate(scholarshipEnd)}.`
      );
    }

    return "";
  };

  // ------------------------------------------
  // GENERATE REPORT
  // ------------------------------------------

  const generateReport = async event => {
    if (event) {
      event.preventDefault();
    }

    setError("");
    setSuccess("");
    setReport(null);

    const validationError = validateReportDates();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoadingReport(true);

      const response = await api.get(
        `/admin/reports/scholarships/${selectedScholarshipId}`,
        {
          params: {
            from: fromDate,
            to: toDate
          }
        }
      );

      setReport(response.data);

      setSuccess(
        "Scholarship report generated successfully."
      );

    } catch (err) {
      setError(getErrorMessage(err));

    } finally {
      setLoadingReport(false);
    }
  };

  // ------------------------------------------
  // DOWNLOAD PDF
  // ------------------------------------------

  const downloadReport = async () => {
    if (!report) {
      setError(
        "Please generate a report before downloading."
      );
      return;
    }

    const validationError = validateReportDates();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setDownloading(true);
      setError("");
      setSuccess("");

      const response = await api.get(
        `/admin/reports/scholarships/${selectedScholarshipId}/pdf`,
        {
          params: {
            from: fromDate,
            to: toDate
          },
          responseType: "blob"
        }
      );

      const blob = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;

      link.download =
        `ScholarConnect_Report_${fromDate}_to_${toDate}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setSuccess(
        "PDF report downloaded successfully."
      );

    } catch (err) {
      setError(
        "Unable to download the PDF report. Please try again."
      );

    } finally {
      setDownloading(false);
    }
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  return (
    <div className="management-page reports-page">

      <AdminSidebar
        activePage="reports"
        variant="management"
      />

      <main className="management-main">

        {/* HEADER */}

        <header className="management-topbar">

          <div>
            <h1>Scholarship Reports</h1>

            <p>
              Generate and download scholarship-wise application reports.
            </p>
          </div>

          <div className="management-user">

            <div className="management-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <strong>
                {user?.fullName || "Administrator"}
              </strong>

              <span>Administrator</span>
            </div>

            <button
              type="button"
              className="management-refresh"
              onClick={fetchScholarships}
              title="Refresh scholarships"
              disabled={loadingScholarships}
            >
              <RefreshCw size={18} />
            </button>

          </div>

        </header>

        {/* BANNER */}

        <section className="reports-banner">

          <div>
            <span>REPORTING & ANALYTICS</span>

            <h2>Scholarship Performance Reports</h2>

            <p>
              Select a scholarship and reporting period to review
              application statistics and download a detailed PDF report.
            </p>
          </div>

          <div className="reports-banner-icon">
            <FileSpreadsheet size={55} />
          </div>

        </section>

        {/* ALERTS */}

        {error && (
          <div className="reports-alert reports-alert-error">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="reports-alert reports-alert-success">
            <CheckCircle2 size={19} />
            <span>{success}</span>
          </div>
        )}

        {/* FILTER CARD */}

        <section className="reports-filter-card">

          <div className="reports-section-heading">
            <div>
              <h2>Generate Report</h2>

              <p>
                Search for a scholarship and select the reporting period.
              </p>
            </div>
          </div>

          <form
            className="reports-filter-grid"
            onSubmit={generateReport}
          >

            {/* SCHOLARSHIP SEARCH */}

            <div className="reports-field reports-scholarship-field">

              <label htmlFor="report-search">
                Search Scholarship
              </label>

              <div className="reports-search-wrapper">
                <Search size={19} />

                <input
                  id="report-search"
                  type="search"
                  placeholder="Type scholarship name..."
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  disabled={loadingScholarships}
                />
              </div>

              <label htmlFor="report-scholarship">
                Select Scholarship
              </label>

              <select
                id="report-scholarship"
                value={selectedScholarshipId}
                onChange={handleScholarshipChange}
                disabled={
                  loadingScholarships ||
                  scholarships.length === 0
                }
                required
              >
                <option value="">
                  {loadingScholarships
                    ? "Loading scholarships..."
                    : "Select a scholarship"}
                </option>

                {filteredScholarships.map(scholarship => (
                  <option
                    key={scholarship.id}
                    value={String(scholarship.id)}
                  >
                    {scholarship.name}
                    {scholarship.active
                      ? " (Active)"
                      : " (Inactive)"}
                  </option>
                ))}
              </select>

              {!loadingScholarships &&
                scholarships.length > 0 &&
                filteredScholarships.length === 0 && (
                  <small className="reports-field-hint">
                    No scholarship matches your search.
                  </small>
                )}

            </div>

            {/* FROM DATE */}

            <div className="reports-field">

              <label htmlFor="report-from">
                From Date
              </label>

              <div className="reports-date-wrapper">
                <CalendarDays size={18} />

                <input
                  id="report-from"
                  type="date"
                  value={fromDate}
                  min={selectedScholarship?.startDate || undefined}
                  max={selectedScholarship?.endDate || undefined}
                  onChange={handleFromDateChange}
                  disabled={!selectedScholarship}
                  required
                />
              </div>

            </div>

            {/* TO DATE */}

            <div className="reports-field">

              <label htmlFor="report-to">
                To Date
              </label>

              <div className="reports-date-wrapper">
                <CalendarDays size={18} />

                <input
                  id="report-to"
                  type="date"
                  value={toDate}
                  min={selectedScholarship?.startDate || undefined}
                  max={selectedScholarship?.endDate || undefined}
                  onChange={handleToDateChange}
                  disabled={!selectedScholarship}
                  required
                />
              </div>

            </div>

            {/* SEARCH BUTTON */}

            <div className="reports-filter-actions">

              <button
                type="submit"
                className="reports-generate-button"
                disabled={
                  loadingReport ||
                  loadingScholarships ||
                  !selectedScholarshipId
                }
              >
                {loadingReport
                  ? "Generating..."
                  : "Search Report"}

                {!loadingReport && <Search size={18} />}
              </button>

            </div>

          </form>

          {/* SCHOLARSHIP PERIOD */}

          {selectedScholarship && (
            <>
              <div className="reports-selected-info">

                <GraduationCap size={18} />

                <div>
                  <strong>
                    {selectedScholarship.name}
                  </strong>

                  <span>
                    Scholarship application period:{" "}
                    {formatDate(selectedScholarship.startDate)}
                    {" – "}
                    {formatDate(selectedScholarship.endDate)}
                  </span>
                </div>

                <span
                  className={`reports-active-badge ${
                    selectedScholarship.active
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {selectedScholarship.active
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <div className="reports-period-hint">

                <CalendarDays size={15} />

                <span>
                  Report dates must remain within the scholarship period:
                </span>

                <strong>
                  {formatDate(selectedScholarship.startDate)}
                  {" – "}
                  {formatDate(selectedScholarship.endDate)}
                </strong>

              </div>
            </>
          )}

        </section>

        {/* LOADING */}

        {loadingReport && (
          <div className="reports-empty">
            <RefreshCw
              size={25}
              className="reports-loading-icon"
            />

            <strong>
              Generating scholarship report...
            </strong>

            <span>
              Please wait while we calculate the statistics.
            </span>
          </div>
        )}

        {/* REPORT RESULT */}

        {!loadingReport && report && (
          <>

            <section className="reports-result-heading">

              <div>
                <span>GENERATED REPORT</span>

                <h2>
                  {report.scholarshipName}
                </h2>

                <p>
                  Scholarship period:{" "}
                  {formatDate(selectedScholarship?.startDate)}
                  {" – "}
                  {formatDate(selectedScholarship?.endDate)}
                </p>

                <p>
                  Report period:{" "}
                  {formatDate(report.reportFromDate)}
                  {" – "}
                  {formatDate(report.reportToDate)}
                </p>
              </div>

              <div className="reports-download-actions">

                <button
                  type="button"
                  className="reports-refresh-button"
                  onClick={() => generateReport()}
                  disabled={loadingReport}
                >
                  <RefreshCw size={17} />
                  Refresh
                </button>

                <button
                  type="button"
                  className="reports-download-button"
                  onClick={downloadReport}
                  disabled={downloading}
                >
                  <Download size={18} />

                  {downloading
                    ? "Downloading..."
                    : "Download PDF"}
                </button>

              </div>

            </section>

            {/* STATISTICS */}

            <section className="reports-stats-grid">

              <article className="reports-stat-card blue">
                <div className="reports-stat-icon">
                  <FileText size={22} />
                </div>

                <span>Total Applications</span>
                <strong>{report.totalApplications}</strong>

                <small>
                  Submitted in selected period
                </small>
              </article>

              <article className="reports-stat-card orange">
                <div className="reports-stat-icon">
                  <Clock size={22} />
                </div>

                <span>Pending Applications</span>
                <strong>{report.pendingApplications}</strong>

                <small>
                  Awaiting final decision
                </small>
              </article>

              <article className="reports-stat-card green">
                <div className="reports-stat-icon">
                  <CheckCircle2 size={22} />
                </div>

                <span>Approved Applications</span>
                <strong>{report.approvedApplications}</strong>

                <small>
                  Successfully approved
                </small>
              </article>

              <article className="reports-stat-card red">
                <div className="reports-stat-icon">
                  <XCircle size={22} />
                </div>

                <span>Rejected Applications</span>
                <strong>{report.rejectedApplications}</strong>

                <small>
                  Rejected after review
                </small>
              </article>

            </section>

            {/* PENDING BREAKDOWN */}

            <section className="reports-breakdown-card">

              <div className="reports-section-heading">
                <div>
                  <h2>
                    Pending Application Breakdown
                  </h2>

                  <p>
                    Understand which applications are still in progress.
                  </p>
                </div>
              </div>

              <div className="reports-breakdown-grid">

                <div>
                  <span>Submitted</span>
                  <strong>
                    {report.submittedApplications}
                  </strong>
                </div>

                <div>
                  <span>Under Review</span>
                  <strong>
                    {report.underReviewApplications}
                  </strong>
                </div>

                <div>
                  <span>Correction Requested</span>
                  <strong>
                    {report.correctionRequestedApplications}
                  </strong>
                </div>

              </div>

            </section>

            {/* APPLICATION TABLE */}

            <section className="reports-table-card">

              <div className="reports-table-heading">
                <div>
                  <h2>Application Details</h2>

                  <p>
                    {report.applications?.length || 0} submitted
                    applications found.
                  </p>
                </div>
              </div>

              {!report.applications ||
              report.applications.length === 0 ? (

                <div className="reports-empty-table">
                  <FileText size={35} />

                  <strong>
                    No applications found
                  </strong>

                  <span>
                    No submitted applications were found for this
                    scholarship and reporting period.
                  </span>
                </div>

              ) : (

                <div className="reports-table-scroll">

                  <table className="reports-table">

                    <thead>
                      <tr>
                        <th>Application Number</th>
                        <th>Student Name</th>
                        <th>Email Address</th>
                        <th>Application Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {report.applications.map(application => (
                        <tr key={application.applicationId}>

                          <td>
                            <strong>
                              {application.applicationNumber}
                            </strong>
                          </td>

                          <td>
                            {application.studentName || "-"}
                          </td>

                          <td>
                            {application.studentEmail || "-"}
                          </td>

                          <td>
                            {formatDateTime(
                              application.applicationDate
                            )}
                          </td>

                          <td>
                            <span
                              className={`reports-status reports-status-${(
                                application.status || ""
                              ).toLowerCase()}`}
                            >
                              {(application.status || "")
                                .replaceAll("_", " ")}
                            </span>
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>

                </div>
              )}

            </section>

          </>
        )}

        {/* EMPTY STATE */}

        {!loadingReport && !report && !error && (
          <section className="reports-empty">

            <div>
              <BarChart3 size={36} />
            </div>

            <strong>
              Ready to Generate Reports
            </strong>

            <span>
              Select a scholarship, choose the date range and click
              Search Report to view its application statistics.
            </span>

          </section>
        )}

        {/* FOOTER */}

        <footer className="management-footer">
          © 2026 ScholarConnect. Scholarship Management Portal.
        </footer>

      </main>

    </div>
  );
}