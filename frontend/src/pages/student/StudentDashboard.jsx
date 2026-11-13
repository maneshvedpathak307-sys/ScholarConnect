import React, { useCallback, useEffect, useState } from "react";
import {
  GraduationCap,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  RefreshCw,
  AlertCircle,
  ArrowRight
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StudentSidebar from "../../components/StudentSidebar";
import api from "../../services/api";
import "../../styles/StudentDashboard.css";

function formatStatus(status) {
  return (status || "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function StudentDashboard() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");

      const results = await Promise.allSettled([
        api.get("/applications/my"),
        api.get("/scholarships/active"),
        api.get("/notifications")
      ]);

      if (results[0].status === "fulfilled") {
        setApplications(
          Array.isArray(results[0].value.data)
            ? results[0].value.data
            : []
        );
      } else {
        console.error("Applications error:", results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        setScholarships(
          Array.isArray(results[1].value.data)
            ? results[1].value.data
            : []
        );
      } else {
        console.error("Scholarships error:", results[1].reason);
      }

      if (results[2].status === "fulfilled") {
        setNotifications(
          Array.isArray(results[2].value.data)
            ? results[2].value.data
            : []
        );
      } else {
        console.error("Notifications error:", results[2].reason);
      }

      if (results.every(result => result.status === "rejected")) {
        setError("Unable to load student dashboard information.");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unable to load dashboard information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const approved = applications.filter(
    a => a.status === "APPROVED"
  ).length;

  const pending = applications.filter(
    a => ["SUBMITTED", "UNDER_REVIEW"].includes(a.status)
  ).length;

  const rejected = applications.filter(
    a => a.status === "REJECTED"
  ).length;

  const unreadNotifications = notifications.filter(
    n => n.read === false || n.isRead === false
  ).length;

  const statusClass = status => {
    switch (status) {
      case "APPROVED": return "approved";
      case "REJECTED": return "rejected";
      case "UNDER_REVIEW": return "under-review";
      case "SUBMITTED": return "submitted";
      case "CORRECTION_REQUESTED": return "correction";
      default: return "draft";
    }
  };

  return (
    <div className="student-layout">

      <StudentSidebar />

      <main className="student-main">

        <header className="student-topbar">
          <div>
            <h1>Student Dashboard</h1>
            <p>Manage your scholarship applications and opportunities.</p>
          </div>

          <button
            className="student-refresh"
            onClick={fetchDashboard}
            title="Refresh dashboard"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        <section className="student-welcome">
          <div>
            <span>STUDENT PORTAL</span>
            <h2>
              Welcome back, {user?.fullName || "Student"}!
            </h2>
            <p>
              Explore scholarships, submit applications and track
              your application progress.
            </p>

            <Link
              to="/student/scholarships"
              className="student-primary-link"
            >
              Explore Scholarships <ArrowRight size={17} />
            </Link>
          </div>

          <GraduationCap size={75} />
        </section>

        {error && (
          <div className="student-error">
            <AlertCircle size={19} />
            {error}
            <button onClick={fetchDashboard}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="student-empty">Loading dashboard...</div>
        ) : (
          <>
            <section className="student-stats">

              <div className="student-stat-card">
                <div className="student-stat-icon blue">
                  <FileText size={23} />
                </div>
                <div>
                  <span>My Applications</span>
                  <strong>{applications.length}</strong>
                </div>
              </div>

              <div className="student-stat-card">
                <div className="student-stat-icon orange">
                  <Clock size={23} />
                </div>
                <div>
                  <span>Pending</span>
                  <strong>{pending}</strong>
                </div>
              </div>

              <div className="student-stat-card">
                <div className="student-stat-icon green">
                  <CheckCircle size={23} />
                </div>
                <div>
                  <span>Approved</span>
                  <strong>{approved}</strong>
                </div>
              </div>

              <div className="student-stat-card">
                <div className="student-stat-icon red">
                  <XCircle size={23} />
                </div>
                <div>
                  <span>Rejected</span>
                  <strong>{rejected}</strong>
                </div>
              </div>

            </section>

            <section className="student-content-grid">

              <div className="student-panel">
                <div className="student-panel-heading">
                  <div>
                    <h2>Recent Applications</h2>
                    <p>Track your latest application activity.</p>
                  </div>

                  <Link to="/student/applications">
                    View All <ArrowRight size={15} />
                  </Link>
                </div>

                {applications.length === 0 ? (
                  <div className="student-empty">
                    You have not created an application yet.
                    <Link to="/student/scholarships">
                      Browse scholarships
                    </Link>
                  </div>
                ) : (
                  <div className="student-list">
                    {applications.slice(0, 5).map(application => (
                      <div
                        className="student-application-row"
                        key={application.id}
                      >
                        <div>
                          <strong>
                            {application.scholarship?.name ||
                              application.applicationNumber ||
                              `Application #${application.id}`}
                          </strong>
                          <span>
                            {application.applicationNumber || "-"}
                          </span>
                        </div>

                        <span
                          className={`student-status ${statusClass(application.status)}`}
                        >
                          {formatStatus(application.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="student-panel">
                <div className="student-panel-heading">
                  <div>
                    <h2>Notifications</h2>
                    <p>Your latest portal updates.</p>
                  </div>

                  <Bell size={20} />
                </div>

                <div className="student-notification-count">
                  <strong>{unreadNotifications}</strong>
                  <span>Unread notifications</span>
                </div>

                {notifications.length === 0 ? (
                  <div className="student-empty">
                    No notifications available.
                  </div>
                ) : (
                  notifications.slice(0, 4).map(notification => (
                    <div
                      className="student-notification-row"
                      key={notification.id}
                    >
                      <strong>
                        {notification.title || "Portal Notification"}
                      </strong>
                      <p>
                        {notification.message ||
                          notification.content ||
                          "You have a new update."}
                      </p>
                    </div>
                  ))
                )}

                <Link
                  className="student-panel-link"
                  to="/student/notifications"
                >
                  View notifications <ArrowRight size={15} />
                </Link>
              </div>

            </section>

            <section className="student-panel student-scholarship-panel">
              <div className="student-panel-heading">
                <div>
                  <h2>Available Scholarships</h2>
                  <p>Explore currently active scholarship schemes.</p>
                </div>

                <Link to="/student/scholarships">
                  View All <ArrowRight size={15} />
                </Link>
              </div>

              {scholarships.length === 0 ? (
                <div className="student-empty">
                  No active scholarships are available currently.
                </div>
              ) : (
                <div className="student-scholarship-preview">
                  {scholarships.slice(0, 3).map(scholarship => (
                    <article key={scholarship.id}>
                      <GraduationCap size={25} />
                      <h3>{scholarship.name}</h3>
                      <p>
                        {scholarship.description ||
                          "Scholarship opportunity"}
                      </p>
                      <strong>
                        ₹{Number(scholarship.awardAmount || 0)
                          .toLocaleString("en-IN")}
                      </strong>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="student-footer">
          © 2026 ScholarConnect. Student Scholarship Portal.
        </footer>

      </main>
    </div>
  );
}

export default StudentDashboard;