import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import AdminSidebar from "../../components/AdminSidebar";

import {
  Users,
  RefreshCw,
  Search,
  Eye,
  X,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import "../../styles/Students.css";

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function Students() {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // LOAD STUDENTS
  const fetchStudents = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/admin/students");

      setStudents(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error("Students loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load students."
      );

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // SEARCH STUDENTS
  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return students.filter(student =>
      (student.fullName || "")
        .toLowerCase()
        .includes(query) ||

      (student.email || "")
        .toLowerCase()
        .includes(query) ||

      (student.mobileNumber || "")
        .toLowerCase()
        .includes(query)
    );

  }, [students, search]);

  return (
    <div className="management-page">

      {/* ADMIN SIDEBAR */}
      <AdminSidebar
        activePage="students"
        variant="management"
      />

      {/* MAIN CONTENT */}
      <main className="management-main">

        {/* HEADER */}
        <header className="management-topbar">

          <div>
            <h1>Students</h1>

            <p>
              View and manage registered student accounts.
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
              onClick={fetchStudents}
              title="Refresh students"
              disabled={loading}
            >
              <RefreshCw size={18} />
            </button>

          </div>

        </header>

        {/* BANNER */}
        <section className="management-banner">

          <div>
            <span>STUDENT MANAGEMENT</span>

            <h2>Registered Students</h2>

            <p>
              View student profiles and monitor account registration
              information from one place.
            </p>
          </div>

          <Users size={55} />

        </section>

        {/* STATISTICS */}
        <section className="management-stats">

          <div className="management-stat-card">
            <Users />

            <span>Total Students</span>

            <strong>
              {students.length}
            </strong>
          </div>

          <div className="management-stat-card">
            <CheckCircle />

            <span>Active Accounts</span>

            <strong>
              {students.filter(student => student.enabled).length}
            </strong>
          </div>

          <div className="management-stat-card">
            <XCircle />

            <span>Disabled Accounts</span>

            <strong>
              {students.filter(student => !student.enabled).length}
            </strong>
          </div>

        </section>

        {/* ERROR MESSAGE */}
        {error && (

          <div className="management-error">

            <AlertCircle size={18} />

            {error}

            <button
              type="button"
              onClick={fetchStudents}
            >
              Retry
            </button>

          </div>

        )}

        {/* SEARCH */}
        <section className="management-toolbar">

          <div className="management-search">

            <Search size={19} />

            <input
              type="search"
              placeholder="Search student name, email or mobile number..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />

          </div>

        </section>

        {/* STUDENT TABLE */}
        <section className="management-table-card">

          <div className="management-table-heading">

            <div>
              <h2>All Students</h2>

              <p>
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </div>

          </div>

          {loading ? (

            <div className="management-empty">
              Loading students...
            </div>

          ) : filteredStudents.length === 0 ? (

            <div className="management-empty">
              No students found.
            </div>

          ) : (

            <div className="management-table-scroll">

              <table className="management-table">

                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email Address</th>
                    <th>Mobile Number</th>
                    <th>Registered Date</th>
                    <th>Account Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredStudents.map(student => (

                    <tr key={student.id}>

                      <td>
                        <strong>
                          {student.fullName || "-"}
                        </strong>

                        
                      </td>

                      <td>
                        {student.email || "-"}
                      </td>

                      <td>
                        {student.mobileNumber || "-"}
                      </td>

                      <td>
                        {formatDate(student.createdAt)}
                      </td>

                      <td>

                        <span
                          className={`management-status ${
                            student.enabled ? "active" : "inactive"
                          }`}
                        >
                          {student.enabled ? "Active" : "Disabled"}
                        </span>

                      </td>

                      <td>

                        <button
                          type="button"
                          className="management-view-button"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <Eye size={15} />
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

        {/* FOOTER */}
        <footer className="management-footer">
          © 2026 ScholarConnect. Scholarship Management Portal.
        </footer>

      </main>

      {/* STUDENT PROFILE MODAL */}
      {selectedStudent && (

        <div
          className="management-overlay"
          onClick={() => setSelectedStudent(null)}
        >

          <div
            className="management-modal"
            onClick={event => event.stopPropagation()}
          >

            <div className="management-modal-header">

              <div>
                <h2>Student Profile</h2>

                <p>
                  Student ID: {selectedStudent.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close student profile"
              >
                <X size={21} />
              </button>

            </div>

            <div className="management-profile-icon">
              {selectedStudent.fullName?.charAt(0)?.toUpperCase() || "S"}
            </div>

            <h3 className="management-profile-name">
              {selectedStudent.fullName || "Student"}
            </h3>

            <span
              className={`management-status ${
                selectedStudent.enabled ? "active" : "inactive"
              }`}
            >
              {selectedStudent.enabled
                ? "Active Account"
                : "Disabled Account"}
            </span>

            <div className="management-profile-details">

              <div>
                <Mail size={18} />

                <section>
                  <span>Email Address</span>

                  <strong>
                    {selectedStudent.email || "-"}
                  </strong>
                </section>
              </div>

              <div>
                <Phone size={18} />

                <section>
                  <span>Mobile Number</span>

                  <strong>
                    {selectedStudent.mobileNumber || "-"}
                  </strong>
                </section>
              </div>

              <div>
                <Calendar size={18} />

                <section>
                  <span>Registration Date</span>

                  <strong>
                    {formatDate(selectedStudent.createdAt)}
                  </strong>
                </section>
              </div>

            </div>

            <p className="management-note">
              This profile displays the student account information
              currently available in the system.
            </p>

          </div>

        </div>

      )}

    </div>
  );
}