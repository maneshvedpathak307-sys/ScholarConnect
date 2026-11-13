import React, { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  GraduationCap,
  TrendingUp,
  AlertCircle
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "../../styles/AdminDashboard.css";

function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD STATISTICS
  // =====================================================

  const fetchStats = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Dashboard statistics error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Please log in using an Admin account.");
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard statistics. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // =====================================================
  // STATISTICS CARDS
  // =====================================================

  const cards = [
    {
      title: "Total Applications",
      value: stats?.TOTAL ?? 0,
      icon: FileText,
      color: "blue"
    },
    {
      title: "Pending Applications",
      value: stats?.PENDING ?? 0,
      icon: Clock,
      color: "orange"
    },
    {
      title: "Approved Applications",
      value: stats?.APPROVED ?? 0,
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Rejected Applications",
      value: stats?.REJECTED ?? 0,
      icon: XCircle,
      color: "red"
    }
  ];

  // =====================================================
  // CHART DATA
  // =====================================================

  const chartData = stats
    ? [
        {
          name: "Draft",
          applications: stats.DRAFT ?? 0
        },
        {
          name: "Submitted",
          applications: stats.SUBMITTED ?? 0
        },
        {
          name: "Under Review",
          applications: stats.UNDER_REVIEW ?? 0
        },
        {
          name: "Correction",
          applications: stats.CORRECTION_REQUESTED ?? 0
        },
        {
          name: "Approved",
          applications: stats.APPROVED ?? 0
        },
        {
          name: "Rejected",
          applications: stats.REJECTED ?? 0
        }
      ]
    : [];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}

      <AdminSidebar activePage="dashboard" variant="admin" />

      {/* MAIN CONTENT */}

      <main className="admin-main">

        {/* TOP HEADER */}

        <header className="admin-topbar">

          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Overview of your scholarship management portal.
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
              onClick={fetchStats}
              title="Refresh statistics"
              disabled={loading}
            >
              <RefreshCw size={18} />
            </button>

          </div>

        </header>

        {/* WELCOME SECTION */}

        <section className="admin-welcome">

          <div>
            <span className="admin-welcome-tag">
              <TrendingUp size={15} />
              MANAGEMENT OVERVIEW
            </span>

            <h2>
              Welcome back, {user?.fullName || "Admin"}!
            </h2>

            <p>
              Monitor scholarship applications and manage student requests
              from one place.
            </p>
          </div>

          <div className="admin-welcome-icon">
            <GraduationCap size={65} />
          </div>

        </section>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="admin-error">
            <AlertCircle size={20} />

            <span>{error}</span>

            <button
              type="button"
              onClick={fetchStats}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="admin-loading">
            Loading dashboard statistics...
          </div>
        )}

        {/* STATISTICS AND CHARTS */}

        {!loading && stats && (
          <>

            {/* STATISTICS HEADING */}

            <section className="admin-section-heading">
              <div>
                <h2>Application Statistics</h2>
                <p>
                  Live statistics from your scholarship database.
                </p>
              </div>
            </section>

            {/* STATISTICS CARDS */}

            <section className="admin-stats-grid">

              {cards.map(card => {
                const Icon = card.icon;

                return (
                  <div
                    className="admin-stat-card"
                    key={card.title}
                  >

                    <div className={`admin-stat-icon ${card.color}`}>
                      <Icon size={23} />
                    </div>

                    <div className="admin-stat-details">
                      <p>{card.title}</p>
                      <h3>{card.value}</h3>
                    </div>

                  </div>
                );
              })}

            </section>

            {/* CHARTS AND STATUS */}

            <section className="admin-dashboard-grid">

              {/* APPLICATION CHART */}

              <div className="admin-chart-card">

                <div className="admin-card-heading">
                  <div>
                    <h2>Application Overview</h2>
                    <p>
                      Applications grouped by current status.
                    </p>
                  </div>
                </div>

                <div className="admin-chart">

                  <ResponsiveContainer width="100%" height="100%">

                    <BarChart
                      data={chartData}
                      margin={{
                        top: 15,
                        right: 10,
                        left: -15,
                        bottom: 5
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        interval={0}
                      />

                      <YAxis allowDecimals={false} />

                      <Tooltip />

                      <Bar
                        dataKey="applications"
                        fill="#2878e8"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

              {/* APPROVAL SUMMARY */}

              <div className="admin-summary-card">

                <h2>Approval Summary</h2>
                <p>Overall application approval rate.</p>

                <div className="admin-approval-circle">

                  <strong>
                    {stats.APPROVAL_RATE ?? 0}%
                  </strong>

                  <span>Approval Rate</span>

                </div>

                <div className="admin-summary-row">
                  <span>Total Applications</span>
                  <strong>{stats.TOTAL ?? 0}</strong>
                </div>

                <div className="admin-summary-row">
                  <span>Approved</span>
                  <strong>{stats.APPROVED ?? 0}</strong>
                </div>

                <div className="admin-summary-row">
                  <span>Pending</span>
                  <strong>{stats.PENDING ?? 0}</strong>
                </div>

              </div>

            </section>

          </>
        )}

        {/* EMPTY STATE */}

        {!loading && !stats && !error && (
          <div className="admin-loading">
            No dashboard statistics available.
          </div>
        )}

        {/* FOOTER */}

        <footer className="admin-footer">
          © 2026 ScholarConnect. Scholarship Management Portal.
        </footer>

      </main>

    </div>
  );
}

export default AdminDashboard;