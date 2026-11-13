import React from "react";
import { Link, useLocation } from "react-router-dom";

import {
  GraduationCap,
  ShieldAlert,
  SearchX,
  ArrowRight,
  Home,
  LockKeyhole
} from "lucide-react";

import "../styles/Error.css";

export default function Error() {
  const location = useLocation();

  const isUnauthorized =
    location.pathname === "/unauthorized";

  const errorCode = isUnauthorized ? "403" : "404";

  const title = isUnauthorized
    ? "Access Denied"
    : "Page Not Found";

  const description = isUnauthorized
    ? "Sorry, you don't have permission to access this page. Please sign in with an account that has the required access."
    : "Sorry, the page you're looking for doesn't exist or may have been moved. Let's get you back to ScholarConnect.";

  return (
    <main className="sc-error-page">

      <section className="sc-error-card">

        {/* BRAND HEADER */}

        <Link to="/" className="sc-error-brand">

          <span className="sc-error-brand-icon">
            <GraduationCap size={27} />
          </span>

          <span className="sc-error-brand-text">

            <strong>
              Scholar<span>Connect</span>
            </strong>

            <small>
              Scholarship Management Portal
            </small>

          </span>

        </Link>

        {/* ERROR CONTENT */}

        <div className="sc-error-content">

          <div className="sc-error-icon">

            {isUnauthorized ? (
              <ShieldAlert size={43} />
            ) : (
              <SearchX size={43} />
            )}

          </div>

          <span className="sc-error-code">
            ERROR {errorCode}
          </span>

          <h1>{title}</h1>

          <p className="sc-error-description">
            {description}
          </p>

          {/* ACTION BUTTONS */}

          <div className="sc-error-actions">

            <Link
              to="/"
              className="sc-error-home-button"
            >
              <Home size={17} />
              Back to Home
            </Link>

            {isUnauthorized && (
              <Link
                to="/login"
                className="sc-error-login-button"
              >
                Sign In
                <ArrowRight size={17} />
              </Link>
            )}

          </div>

          <div className="sc-error-help">

            <LockKeyhole size={16} />

            <span>
              Your educational journey is protected by
              secure authentication.
            </span>

          </div>

        </div>

        {/* FOOTER */}

        <footer className="sc-error-footer">

          <GraduationCap size={18} />

          <span>
            ScholarConnect — Scholarship Management Portal
          </span>

        </footer>

      </section>

    </main>
  );
}