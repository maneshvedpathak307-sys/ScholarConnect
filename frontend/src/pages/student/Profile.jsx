import React, { useCallback, useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ShieldCheck
} from "lucide-react";

import StudentSidebar from "../../components/StudentSidebar";
import api from "../../services/api";

import "../../styles/Profile.css";

const initialForm = {
  fullName: "",
  email: "",
  mobileNumber: "",
  dateOfBirth: "",
  gender: ""
};

export default function Profile() {

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LOAD PROFILE
  const loadProfile = useCallback(async () => {

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      const response = await api.get("/student/profile");

      const data = response.data;

      setForm({
        fullName: data.fullName || "",
        email: data.email || "",
        mobileNumber: data.mobileNumber || "",
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || ""
      });

    } catch (err) {

      console.error("Profile loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load your profile."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // HANDLE INPUTS
  const handleChange = event => {

    const { name, value } = event.target;

    setForm(current => ({
      ...current,
      [name]: value
    }));

  };

  // UPDATE PROFILE
  const handleSubmit = async event => {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (
      form.mobileNumber &&
      !/^[0-9+() -]{7,15}$/.test(form.mobileNumber)
    ) {
      setError("Please enter a valid mobile number.");
      return;
    }

    if (form.dateOfBirth && form.dateOfBirth > new Date().toISOString().slice(0, 10)) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    setSaving(true);

    try {

      const response = await api.put("/student/profile", {
        fullName: form.fullName.trim(),
        mobileNumber: form.mobileNumber,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender
      });

      const data = response.data;

      setForm({
        fullName: data.fullName || "",
        email: data.email || "",
        mobileNumber: data.mobileNumber || "",
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || ""
      });

      setSuccess("Your profile has been updated successfully.");

    } catch (err) {

      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to update your profile."
      );

    } finally {

      setSaving(false);

    }

  };

  const initial = form.fullName
  ? form.fullName.trim().charAt(0).toUpperCase()
  : "S";
  return (

    <div className="student-layout">

      <StudentSidebar />

      <main className="student-main sc-extra-main">

        {/* HEADER */}

        <header className="sc-extra-header">

          <div>

            <span className="sc-extra-eyebrow">
              STUDENT ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              View and manage your personal account information.
            </p>

          </div>

          <button
            type="button"
            className="sc-extra-refresh"
            onClick={loadProfile}
            disabled={loading || saving}
          >

            <RefreshCw size={17} />

            Refresh

          </button>

        </header>

        {error && (

          <div className="sc-extra-alert">

            <AlertCircle size={19} />

            {error}

          </div>

        )}

        {success && (

          <div className="sc-extra-success">

            <CheckCircle size={19} />

            {success}

          </div>

        )}

        {loading ? (

          <div className="sc-extra-card sc-extra-loading">
            Loading your profile...
          </div>

        ) : (

          <>

            {/* PROFILE SUMMARY */}

            <section className="sc-profile-banner">

              <div className="sc-profile-avatar">
                {initial}
              </div>

              <div className="sc-profile-summary">

                <span>STUDENT ACCOUNT</span>

                <h2>{form.fullName || "Student"}</h2>

                <p>{form.email}</p>

              </div>

              <div className="sc-profile-verified">
                <ShieldCheck size={18} />
                Registered Account
              </div>

            </section>

            {/* PROFILE FORM */}

            <section className="sc-extra-card">

              <div className="sc-extra-card-header">

                <div>
                  <h2>Personal Information</h2>
                  <p>Update your registered personal details.</p>
                </div>

                <User size={23} />

              </div>

              <form onSubmit={handleSubmit}>

                <div className="sc-profile-form-grid">

                  <label className="sc-extra-field">

                    <span>Full Name *</span>

                    <div className="sc-input-icon">
                      <User size={17} />

                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        maxLength="100"
                        placeholder="Enter your full name"
                        required
                      />

                    </div>

                  </label>

                  <label className="sc-extra-field">

                    <span>Email Address</span>

                    <div className="sc-input-icon">
                      <Mail size={17} />

                      <input
                        type="email"
                        value={form.email}
                        readOnly
                      />

                    </div>

                    <small>
                      Email address cannot be changed here.
                    </small>

                  </label>

                  <label className="sc-extra-field">

                    <span>Mobile Number</span>

                    <div className="sc-input-icon">
                      <Phone size={17} />

                      <input
                        type="tel"
                        name="mobileNumber"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        maxLength="15"
                        placeholder="Enter mobile number"
                      />

                    </div>

                  </label>

                  <label className="sc-extra-field">

                    <span>Date of Birth</span>

                    <div className="sc-input-icon">
                      <Calendar size={17} />

                      <input
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        max={new Date().toISOString().slice(0, 10)}
                      />

                    </div>

                  </label>

                  <label className="sc-extra-field">

                    <span>Gender</span>

                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >

                      <option value="">
                        Select gender
                      </option>

                      <option value="MALE">
                        Male
                      </option>

                      <option value="FEMALE">
                        Female
                      </option>

                      <option value="OTHER">
                        Other
                      </option>

                      <option value="PREFER_NOT_TO_SAY">
                        Prefer not to say
                      </option>

                    </select>

                  </label>

                </div>

                <div className="sc-profile-save-row">

                  <p>
                    Make sure your personal information is accurate.
                  </p>

                  <button
                    type="submit"
                    className="sc-profile-save"
                    disabled={saving}
                  >

                    <Save size={17} />

                    {saving ? "Saving..." : "Save Changes"}

                  </button>

                </div>

              </form>

            </section>

          </>

        )}

        <footer className="sc-extra-footer">
          © 2026 ScholarConnect. Student Scholarship Portal.
        </footer>

      </main>

    </div>

  );

}