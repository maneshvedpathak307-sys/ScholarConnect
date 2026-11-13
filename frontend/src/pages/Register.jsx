import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  GraduationCap,
  UserPlus,
  ShieldCheck,
  FileText,
  Clock,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  User
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import PublicNavbar from "../components/PublicNavbar";

import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    dateOfBirth: "",
    gender: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = event => {
    const { name, value } = event.target;

    setForm(current => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError("");

    // Full name validation
    if (form.fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    // Password validation
    if (form.password.length < 8 || form.password.length > 72) {
      setError("Password must contain between 8 and 72 characters.");
      return;
    }

    // Mobile validation
    if (!/^[0-9+ -]{10,15}$/.test(form.mobileNumber.trim())) {
      setError("Enter a valid mobile number (10–15 characters).");
      return;
    }

    // Date of birth validation
    if (!form.dateOfBirth) {
      setError("Please select your date of birth.");
      return;
    }

    const selectedDate = new Date(`${form.dateOfBirth}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate >= today
    ) {
      setError("Date of birth must be a date in the past.");
      return;
    }

    // Gender validation
    if (!["Male", "Female", "Other"].includes(form.gender)) {
      setError("Please select your gender.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        mobileNumber: form.mobileNumber.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender
      });

      navigate("/student/dashboard", { replace: true });

    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please check your details and try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">

      <PublicNavbar activePage="register" />

      <main className="auth-page">

        <div className="auth-layout auth-register-layout">

          {/* LEFT BRAND PANEL */}
          <section className="auth-brand-panel">

            <Link to="/" className="auth-brand">

              <div className="auth-brand-logo">
                <GraduationCap size={27} />
              </div>

              <div>
                <h2>ScholarConnect</h2>
                <span>Scholarship Management Portal</span>
              </div>

            </Link>

            <div className="auth-brand-content">

              <span className="auth-eyebrow">
                START YOUR JOURNEY
              </span>

              <h1>
                Your future.
                <br />
                <span>Starts with opportunity.</span>
              </h1>

              <p>
                Create your account to discover scholarship
                opportunities, submit applications and
                manage your educational journey.
              </p>

              <div className="auth-benefits">

                <div className="auth-benefit">
                  <span>
                    <CheckCircle2 size={18} />
                  </span>

                  <div>
                    <strong>Easy Registration</strong>
                    <small>
                      Create your student account in a few steps.
                    </small>
                  </div>
                </div>

                <div className="auth-benefit">
                  <span>
                    <FileText size={18} />
                  </span>

                  <div>
                    <strong>Online Applications</strong>
                    <small>
                      Complete your scholarship application online.
                    </small>
                  </div>
                </div>

                <div className="auth-benefit">
                  <span>
                    <Clock size={18} />
                  </span>

                  <div>
                    <strong>Stay Updated</strong>
                    <small>
                      Track your application progress anytime.
                    </small>
                  </div>
                </div>

              </div>

            </div>

            <div className="auth-brand-footer">
              <span>ScholarConnect</span>
              <span>One platform. More opportunities.</span>
            </div>

            <div className="auth-decoration auth-decoration-one"></div>
            <div className="auth-decoration auth-decoration-two"></div>

          </section>

          {/* RIGHT REGISTRATION FORM */}
          <section className="auth-form-panel">

            <div className="auth-form-container">

              <div className="auth-mobile-brand">

                <div className="auth-brand-logo">
                  <GraduationCap size={25} />
                </div>

                <strong>ScholarConnect</strong>

              </div>

              <div className="auth-form-heading">

                <span className="auth-form-eyebrow">
                  GET STARTED
                </span>

                <h2>Create your account</h2>

                <p>
                  Enter your details to join ScholarConnect.
                </p>

              </div>

              <form onSubmit={handleSubmit}>

                {/* FULL NAME */}
                <div className="auth-field">

                  <label htmlFor="register-name">
                    Full Name
                  </label>

                  <input
                    id="register-name"
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange}
                    maxLength={100}
                    autoComplete="name"
                    required
                  />

                </div>

                {/* EMAIL */}
                <div className="auth-field">

                  <label htmlFor="register-email">
                    Email Address
                  </label>

                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    maxLength={150}
                    required
                  />

                </div>

                {/* MOBILE */}
                <div className="auth-field">

                  <label htmlFor="register-mobile">
                    Mobile Number
                  </label>

                  <input
                    id="register-mobile"
                    type="tel"
                    name="mobileNumber"
                    placeholder="Enter your mobile number"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    maxLength={15}
                    autoComplete="tel"
                    required
                  />

                </div>

                {/* DATE OF BIRTH */}
                <div className="auth-field">

                  <label htmlFor="register-dob">
                    <CalendarDays size={15} />
                    Date of Birth
                  </label>

                  <input
                    id="register-dob"
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toLocaleDateString("en-CA")}
                    autoComplete="bday"
                    required
                  />

                </div>

                {/* GENDER */}
                <div className="auth-field">

                  <label htmlFor="register-gender">
                    <User size={15} />
                    Gender
                  </label>

                  <select
                    id="register-gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select your gender
                    </option>

                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>

                  </select>

                </div>

                {/* PASSWORD */}
                <div className="auth-field">

                  <label htmlFor="register-password">
                    Password
                  </label>

                  <div className="auth-password-wrapper">

                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      required
                    />

                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowPassword(current => !current)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword
                        ? <EyeOff size={19} />
                        : <Eye size={19} />
                      }
                    </button>

                  </div>

                  <small className="auth-field-hint">
                    Use at least 8 characters.
                  </small>

                </div>

                {/* ERROR MESSAGE */}
                {error && (
                  <div className="auth-error" role="alert">
                    {error}
                  </div>
                )}

                {/* SUBMIT */}
                <button
                  className="auth-submit"
                  type="submit"
                  disabled={loading}
                >

                  {loading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create Account
                      <UserPlus size={18} />
                    </>
                  )}

                </button>

              </form>

              <div className="auth-footer">
                Already have an account?
                <Link to="/login"> Sign in</Link>
              </div>

              <Link to="/" className="auth-back-home">
                <ArrowLeft size={15} />
                Back to home
              </Link>

              <div className="auth-security-note">
                <ShieldCheck size={16} />
                Your information is protected by secure authentication.
              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Register;