import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  GraduationCap,
  RefreshCw,
  Search,
  Calendar,
  IndianRupee,
  AlertCircle
} from "lucide-react";

import { Link } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import api from "../../services/api";
import "../../styles/StudentScholarships.css";

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function StudentScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Fetch active postgraduate scholarships.
  const fetchScholarships = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/scholarships/active");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      // Display PG scholarships only.
      setScholarships(
        data.filter(scholarship =>
          scholarship.educationLevel === "PG"
        )
      );

    } catch (err) {
      console.error("Scholarship loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load available scholarships."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  // Search postgraduate scholarships.
  const filteredScholarships = useMemo(() => {
    const query = search.toLowerCase().trim();

    return scholarships.filter(scholarship => (
      (scholarship.name || "").toLowerCase().includes(query) ||
      (scholarship.eligibleCategory || "").toLowerCase().includes(query) ||
      (scholarship.eligibleCourse || "").toLowerCase().includes(query)
    ));
  }, [scholarships, search]);

  return (
    <div className="student-layout">

      <StudentSidebar />

      <main className="student-main">

        {/* Header */}
        <header className="student-topbar">

          <div>
            <h1>Browse PG Scholarships</h1>

            <p>
              Discover postgraduate scholarship opportunities
              available to eligible students.
            </p>
          </div>

          <button
            className="student-refresh"
            onClick={fetchScholarships}
            title="Refresh scholarships"
          >
            <RefreshCw size={18} />
          </button>

        </header>

        {/* Welcome Banner */}
        <section className="student-welcome">

          <div>
            <span>POSTGRADUATE OPPORTUNITIES</span>

            <h2>Find the Right PG Scholarship</h2>

            <p>
              Explore postgraduate scholarships, review award
              amounts and check eligibility criteria before applying.
            </p>
          </div>

          <GraduationCap size={75} />

        </section>

        {/* Error */}
        {error && (
          <div className="student-error">
            <AlertCircle size={19} />

            {error}

            <button onClick={fetchScholarships}>
              Retry
            </button>
          </div>
        )}

        {/* Search */}
        <section className="student-toolbar">

          <div className="student-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search PG scholarship, category or course..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

          </div>

          <span>
            {filteredScholarships.length} PG scholarships found
          </span>

        </section>

        {/* Scholarship Cards */}
        {loading ? (

          <div className="student-empty">
            Loading PG scholarships...
          </div>

        ) : filteredScholarships.length === 0 ? (

          <div className="student-empty">
            No PG scholarships found.
          </div>

        ) : (

          <section className="student-scholarship-grid">

            {filteredScholarships.map(scholarship => (

              <article
                className="student-scholarship-card"
                key={scholarship.id}
              >

                <div className="student-scholarship-card-heading">

                  <div className="student-scholarship-icon">
                    <GraduationCap size={25} />
                  </div>

                  <span className="student-active-badge">
                    Active
                  </span>

                </div>

                <h2>{scholarship.name}</h2>

                <p className="student-scholarship-description">
                  {scholarship.description ||
                    "Scholarship details are available below."}
                </p>

                {/* Award */}
                <div className="student-award">

                  <IndianRupee size={21} />

                  <strong>
                    {Number(scholarship.awardAmount || 0)
                      .toLocaleString("en-IN")}
                  </strong>

                  <span>Award Amount</span>

                </div>

                {/* Eligibility Details */}
                <div className="student-eligibility">

                  <div>
                    <span>Education Level</span>

                    <strong>
                      Postgraduate (PG)
                    </strong>
                  </div>

                  <div>
                    <span>Eligible Category</span>

                    <strong>
                      {scholarship.eligibleCategory || "All"}
                    </strong>
                  </div>

                  <div>
                    <span>Eligible Course</span>

                    <strong>
                      {scholarship.eligibleCourse || "All"}
                    </strong>
                  </div>

                  <div>
                    <span>Maximum Family Income</span>

                    <strong>
                      ₹{Number(
                        scholarship.maximumFamilyIncome || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>Application Period</span>

                    <strong>
                      <Calendar size={14} />

                      {formatDate(scholarship.startDate)}

                      {" – "}

                      {formatDate(scholarship.endDate)}
                    </strong>
                  </div>

                </div>

                {/* Apply */}
                <Link
                  to={`/student/apply/${scholarship.id}`}
                  className="student-apply-button"
                >
                  Apply Now
                </Link>

              </article>

            ))}

          </section>

        )}

        <footer className="student-footer">
          © 2026 ScholarConnect. PG Student Scholarship Portal.
        </footer>

      </main>

    </div>
  );
}