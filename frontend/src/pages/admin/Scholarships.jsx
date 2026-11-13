import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import AdminSidebar from "../../components/AdminSidebar";

import {
  GraduationCap,
  RefreshCw,
  Search,
  Plus,
  Pencil,
  X,
  IndianRupee,
  CheckCircle,
  XCircle,
  AlertCircle,
  Power
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

import "../../styles/Scholarships.css";

const CATEGORIES = [
  "OPEN",
  "EWS",
  "OBC",
  "SC",
  "ST",
  "VJNT / NT",
  "SBC",
  "MINORITY"
];

const EMPTY_FORM = {
  name: "",
  description: "",
  educationLevel: "PG",
  eligibleCategory: "",
  eligibleCourse: "",
  maximumFamilyIncome: "",
  awardAmount: "",
  startDate: "",
  endDate: "",
  active: true
};

const dateFormat = date => {
  if (!date) return "-";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

function getErrorMessage(err) {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    "Unable to process the scholarship request."
  );
}

export default function Scholarships() {
  const { user } = useAuth();

  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // LOAD PG SCHOLARSHIPS
  const fetchScholarships = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/admin/scholarships");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setScholarships(
        data.filter(
          scholarship =>
            scholarship.educationLevel === "PG"
        )
      );

    } catch (err) {
      console.error("Scholarships loading error:", err);

      setError(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  // SEARCH SCHOLARSHIPS
  const filteredScholarships = useMemo(() => {
    const query = search.toLowerCase().trim();

    return scholarships.filter(scholarship =>
      (scholarship.name || "")
        .toLowerCase()
        .includes(query) ||

      (scholarship.eligibleCategory || "")
        .toLowerCase()
        .includes(query) ||

      (scholarship.eligibleCourse || "")
        .toLowerCase()
        .includes(query)
    );

  }, [scholarships, search]);

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setModalOpen(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = scholarship => {
    setEditingId(scholarship.id);

    setForm({
      name: scholarship.name || "",
      description: scholarship.description || "",
      educationLevel: "PG",
      eligibleCategory: scholarship.eligibleCategory || "",
      eligibleCourse: scholarship.eligibleCourse || "",
      maximumFamilyIncome:
        scholarship.maximumFamilyIncome ?? "",
      awardAmount: scholarship.awardAmount ?? "",
      startDate: scholarship.startDate || "",
      endDate: scholarship.endDate || "",
      active: scholarship.active ?? true
    });

    setFormError("");
    setModalOpen(true);
  };

  // HANDLE FORM INPUTS
  const handleInput = event => {
    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // CREATE OR UPDATE SCHOLARSHIP
  const submitScholarship = async event => {
    event.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Please enter the scholarship name.");
      return;
    }

    if (!form.eligibleCategory) {
      setFormError("Please select an eligible category.");
      return;
    }

    if (!form.eligibleCourse.trim()) {
      setFormError("Please enter the eligible course.");
      return;
    }

    if (
      form.maximumFamilyIncome === "" ||
      !Number.isFinite(Number(form.maximumFamilyIncome)) ||
      Number(form.maximumFamilyIncome) < 0 ||
      form.awardAmount === "" ||
      !Number.isFinite(Number(form.awardAmount)) ||
      Number(form.awardAmount) < 0
    ) {
      setFormError(
        "Enter a valid income limit and award amount."
      );
      return;
    }

    if (!form.startDate || !form.endDate) {
      setFormError("Please select both start and end dates.");
      return;
    }

    if (form.endDate < form.startDate) {
      setFormError(
        "End date cannot be earlier than start date."
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      educationLevel: "PG",
      eligibleCategory: form.eligibleCategory,
      eligibleCourse: form.eligibleCourse.trim(),
      maximumFamilyIncome: Number(form.maximumFamilyIncome),
      awardAmount: Number(form.awardAmount),
      startDate: form.startDate,
      endDate: form.endDate,
      active: form.active
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.put(
          `/admin/scholarships/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/admin/scholarships",
          payload
        );
      }

      setModalOpen(false);
      setForm({ ...EMPTY_FORM });

      await fetchScholarships();

    } catch (err) {
      console.error("Scholarship save error:", err);

      setFormError(getErrorMessage(err));

    } finally {
      setSaving(false);
    }
  };

  // ACTIVATE OR DEACTIVATE SCHOLARSHIP
  const toggleActive = async scholarship => {
    const confirmed = window.confirm(
      `${scholarship.active ? "Deactivate" : "Activate"} "${scholarship.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const payload = {
        name: scholarship.name,
        description: scholarship.description || "",
        educationLevel: "PG",
        eligibleCategory: scholarship.eligibleCategory || "",
        eligibleCourse: scholarship.eligibleCourse || "",
        maximumFamilyIncome: scholarship.maximumFamilyIncome,
        awardAmount: scholarship.awardAmount,
        startDate: scholarship.startDate,
        endDate: scholarship.endDate,
        active: !scholarship.active
      };

      await api.put(
        `/admin/scholarships/${scholarship.id}`,
        payload
      );

      await fetchScholarships();

    } catch (err) {
      console.error("Scholarship status error:", err);

      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="management-page">

      {/* ADMIN SIDEBAR */}
      <AdminSidebar
        activePage="scholarships"
        variant="management"
      />

      {/* MAIN CONTENT */}
      <main className="management-main">

        {/* HEADER */}
        <header className="management-topbar">

          <div>
            <h1>PG Scholarships</h1>

            <p>
              Create and manage postgraduate scholarship opportunities.
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
              disabled={loading}
            >
              <RefreshCw size={18} />
            </button>

          </div>

        </header>

        {/* BANNER */}
        <section className="management-banner">

          <div>
            <span>POSTGRADUATE SCHOLARSHIP MANAGEMENT</span>

            <h2>PG Scholarship Opportunities</h2>

            <p>
              Manage postgraduate scholarship schemes,
              eligibility criteria and availability.
            </p>
          </div>

          <GraduationCap size={55} />

        </section>

        {/* STATISTICS */}
        <section className="management-stats">

          <div className="management-stat-card">
            <GraduationCap />

            <span>Total PG Scholarships</span>

            <strong>
              {scholarships.length}
            </strong>
          </div>

          <div className="management-stat-card">
            <CheckCircle />

            <span>Active Scholarships</span>

            <strong>
              {scholarships.filter(s => s.active).length}
            </strong>
          </div>

          <div className="management-stat-card">
            <XCircle />

            <span>Inactive Scholarships</span>

            <strong>
              {scholarships.filter(s => !s.active).length}
            </strong>
          </div>

        </section>

        {/* ERROR */}
        {error && (

          <div className="management-error">

            <AlertCircle size={18} />

            {error}

            <button
              type="button"
              onClick={fetchScholarships}
            >
              Retry
            </button>

          </div>

        )}

        {/* SEARCH AND ADD */}
        <section className="management-toolbar">

          <div className="management-search">

            <Search size={19} />

            <input
              type="search"
              placeholder="Search PG scholarship, category or course..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />

          </div>

          <button
            type="button"
            className="management-primary-button"
            onClick={openAddModal}
          >
            <Plus size={17} />
            Add PG Scholarship
          </button>

        </section>

        {/* SCHOLARSHIP CARDS */}
        {loading ? (

          <div className="management-empty">
            Loading PG scholarships...
          </div>

        ) : filteredScholarships.length === 0 ? (

          <div className="management-empty">
            No PG scholarships found.
          </div>

        ) : (

          <section className="scholarship-grid">

            {filteredScholarships.map(scholarship => (

              <article
                className="scholarship-card"
                key={scholarship.id}
              >

                <div className="scholarship-card-top">

                  <div className="scholarship-icon">
                    <GraduationCap size={24} />
                  </div>

                  <span
                    className={`management-status ${
                      scholarship.active ? "active" : "inactive"
                    }`}
                  >
                    {scholarship.active ? "Active" : "Inactive"}
                  </span>

                </div>

                <h3>{scholarship.name}</h3>

                <p className="scholarship-description">
                  {scholarship.description ||
                    "No description provided."}
                </p>

                <div className="scholarship-award">

                  <IndianRupee size={20} />

                  <strong>
                    {Number(
                      scholarship.awardAmount || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                  <span>Award Amount</span>

                </div>

                <div className="scholarship-details">

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
                      {dateFormat(scholarship.startDate)}
                      {" – "}
                      {dateFormat(scholarship.endDate)}
                    </strong>
                  </div>

                </div>

                {/* CARD ACTIONS */}
                <div className="scholarship-card-actions">

                  <button
                    type="button"
                    className="management-view-button"
                    onClick={() => openEditModal(scholarship)}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className={
                      scholarship.active
                        ? "management-deactivate-button"
                        : "management-activate-button"
                    }
                    onClick={() => toggleActive(scholarship)}
                  >
                    <Power size={15} />

                    {scholarship.active
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                </div>

              </article>

            ))}

          </section>

        )}

        {/* FOOTER */}
        <footer className="management-footer">
          © 2026 ScholarConnect. PG Scholarship Management Portal.
        </footer>

      </main>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (

        <div
          className="management-overlay"
          onClick={() => !saving && setModalOpen(false)}
        >

          <div
            className="management-modal management-form-modal"
            onClick={event => event.stopPropagation()}
          >

            <div className="management-modal-header">

              <div>
                <h2>
                  {editingId !== null
                    ? "Edit PG Scholarship"
                    : "Add PG Scholarship"}
                </h2>

                <p>
                  {editingId !== null
                    ? `Updating scholarship ID ${editingId}`
                    : "Enter the postgraduate scholarship information."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={21} />
              </button>

            </div>

            <form onSubmit={submitScholarship}>

              <div className="management-form-grid">

                <label className="management-field full">
                  Scholarship Name *

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    placeholder="e.g. PG OBC Scholarship 2027"
                    required
                  />
                </label>

                <label className="management-field full">
                  Description

                  <textarea
                    name="description"
                    rows="3"
                    value={form.description}
                    onChange={handleInput}
                    placeholder="Describe this PG scholarship"
                  />
                </label>

                <label className="management-field full">
                  Education Level

                  <input
                    type="text"
                    value="Postgraduate (PG)"
                    disabled
                    readOnly
                  />
                </label>

                <label className="management-field">
                  Eligible Category *

                  <select
                    name="eligibleCategory"
                    value={form.eligibleCategory}
                    onChange={handleInput}
                    required
                  >
                    <option value="">
                      Select Category
                    </option>

                    {CATEGORIES.map(category => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}

                  </select>
                </label>

                <label className="management-field">
                  Eligible Course *

                  <input
                    name="eligibleCourse"
                    value={form.eligibleCourse}
                    onChange={handleInput}
                    placeholder="e.g. MCA, MBA, MSc"
                    required
                  />
                </label>

                <label className="management-field">
                  Maximum Family Income (₹) *

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="maximumFamilyIncome"
                    value={form.maximumFamilyIncome}
                    onChange={handleInput}
                    required
                  />
                </label>

                <label className="management-field">
                  Award Amount (₹) *

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="awardAmount"
                    value={form.awardAmount}
                    onChange={handleInput}
                    required
                  />
                </label>

                <label className="management-field">
                  Start Date *

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleInput}
                    required
                  />
                </label>

                <label className="management-field">
                  End Date *

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleInput}
                    required
                  />
                </label>

              </div>

              <label className="management-checkbox">

                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleInput}
                />

                Make this scholarship active

              </label>

              {formError && (
                <p className="management-form-error">
                  {formError}
                </p>
              )}

              <div className="management-form-actions">

                <button
                  type="button"
                  className="management-cancel-button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="management-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Create PG Scholarship"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}