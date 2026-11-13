import React, { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  Inbox
} from "lucide-react";

import StudentSidebar from "../../components/StudentSidebar";
import api from "../../services/api";

import "../../styles/Notifications.css";

export default function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("ALL");

  // LOAD NOTIFICATIONS
  const loadNotifications = useCallback(async () => {

    setLoading(true);
    setError("");

    try {

      const response = await api.get("/notifications");

      setNotifications(
        Array.isArray(response.data) ? response.data : []
      );

    } catch (err) {

      console.error("Notification loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load notifications."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // MARK ONE NOTIFICATION AS READ
  const markAsRead = async id => {

    setUpdatingId(id);
    setError("");

    try {

      const response = await api.put(
        `/notifications/${id}/read`
      );

      setNotifications(current =>
        current.map(item =>
          item.id === id ? response.data : item
        )
      );

    } catch (err) {

      console.error("Mark notification read error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to update notification."
      );

    } finally {

      setUpdatingId(null);

    }

  };

  // DATE FORMAT
  const formatDate = value => {

    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  };

  const unreadCount = notifications.filter(
    item => !item.read
  ).length;

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = notifications.filter(item => {

    if (filter === "UNREAD") return !item.read;

    if (filter === "READ") return item.read;

    return true;

  });

  return (

    <div className="student-layout">

      <StudentSidebar />

      <main className="student-main sc-extra-main">

        {/* HEADER */}

        <header className="sc-extra-header">

          <div>

            <span className="sc-extra-eyebrow">
              STUDENT PORTAL
            </span>

            <h1>Notifications</h1>

            <p>
              Stay updated about your scholarship applications.
            </p>

          </div>

          <button
            type="button"
            className="sc-extra-refresh"
            onClick={loadNotifications}
            disabled={loading}
          >

            <RefreshCw size={17} />

            Refresh

          </button>

        </header>

        {/* ERROR */}

        {error && (

          <div className="sc-extra-alert">

            <AlertCircle size={19} />

            {error}

          </div>

        )}

        {/* STATISTICS */}

        <section className="sc-extra-stats">

          <div className="sc-extra-stat">

            <div className="sc-extra-stat-icon blue">
              <Bell size={23} />
            </div>

            <div>
              <span>Total Notifications</span>
              <strong>{notifications.length}</strong>
            </div>

          </div>

          <div className="sc-extra-stat">

            <div className="sc-extra-stat-icon orange">
              <Inbox size={23} />
            </div>

            <div>
              <span>Unread</span>
              <strong>{unreadCount}</strong>
            </div>

          </div>

          <div className="sc-extra-stat">

            <div className="sc-extra-stat-icon green">
              <CheckCheck size={23} />
            </div>

            <div>
              <span>Read</span>
              <strong>{readCount}</strong>
            </div>

          </div>

        </section>

        {/* FILTER */}

        <section className="sc-extra-card">

          <div className="sc-extra-card-header">

            <div>
              <h2>All Notifications</h2>
              <p>Updates related to your scholarship account.</p>
            </div>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >

              <option value="ALL">All Notifications</option>

              <option value="UNREAD">Unread</option>

              <option value="READ">Read</option>

            </select>

          </div>

          {/* CONTENT */}

          {loading ? (

            <div className="sc-extra-empty">
              Loading notifications...
            </div>

          ) : filteredNotifications.length === 0 ? (

            <div className="sc-extra-empty">

              <Bell size={42} />

              <h3>No notifications found</h3>

              <p>
                {filter === "UNREAD"
                  ? "You have no unread notifications."
                  : "Your scholarship updates will appear here."}
              </p>

            </div>

          ) : (

            <div className="sc-notification-list">

              {filteredNotifications.map(notification => (

                <article
                  key={notification.id}
                  className={`sc-notification-card ${
                    notification.read ? "is-read" : "is-unread"
                  }`}
                >

                  <div className="sc-notification-icon">

                    <Bell size={21} />

                  </div>

                  <div className="sc-notification-content">

                    <div className="sc-notification-title-row">

                      <strong>
                        Scholarship Portal Update
                      </strong>

                      {!notification.read && (

                        <span className="sc-unread-dot">
                          New
                        </span>

                      )}

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <time>
                      {formatDate(notification.createdAt)}
                    </time>

                  </div>

                  {!notification.read && (

                    <button
                      type="button"
                      className="sc-mark-read"
                      disabled={updatingId === notification.id}
                      onClick={() => markAsRead(notification.id)}
                    >

                      <Check size={16} />

                      {updatingId === notification.id
                        ? "Updating..."
                        : "Mark as Read"}

                    </button>

                  )}

                  {notification.read && (

                    <span className="sc-read-label">
                      <CheckCheck size={15} />
                      Read
                    </span>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>

        <footer className="sc-extra-footer">
          © 2026 ScholarConnect. Student Scholarship Portal.
        </footer>

      </main>

    </div>

  );

}