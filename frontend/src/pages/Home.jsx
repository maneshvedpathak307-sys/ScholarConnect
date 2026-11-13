import React from "react";
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  FileText,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  BookOpen,
  Landmark,
  Menu,
  ChevronRight,
  Award,
  LockKeyhole
} from "lucide-react";

import "../styles/Home.css";

function App() {
  const features = [
    {
      icon: <FileText />,
      title: "Easy Application",
      description:
        "Complete your scholarship application through a simple online process."
    },
    {
      icon: <ShieldCheck />,
      title: "Secure Documents",
      description:
        "Upload and manage your scholarship documents securely."
    },
    {
      icon: <Clock />,
      title: "Track Application",
      description:
        "Monitor your application status and receive important updates."
    },
    {
      icon: <Wallet />,
      title: "Financial Support",
      description:
        "Explore scholarship opportunities to support your education."
    }
  ];

  const steps = [
    "Register your account",
    "Check scholarship eligibility",
    "Complete application form",
    "Upload required documents",
    "Track your application"
  ];

  const documents = [
    "Aadhaar Card",
    "Recent Photograph",
    "10th Marksheet",
    "12th Marksheet",
    "Graduation Marksheet",
    "Income Certificate",
    "Bank Passbook",
    "Caste Certificate",
    "Non-Creamy Layer Certificate",
    "Domicile Certificate",
    "Caste Validity Certificate"
  ];

  return (
    <div className="website">

      {/* NAVBAR */}

      <nav className="navbar">
        <div className="nav-container">

          <a href="/" className="brand">
            <div className="brand-icon">
              <GraduationCap size={27} />
            </div>

            <div>
              <h2>
                Scholar<span>Connect</span>
              </h2>
              <small>Scholarship Management Portal</small>
            </div>
          </a>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#scholarship">Scholarships</a>
            <a href="#process">How It Works</a>
            <a href="#documents">Documents</a>
          </div>

          <div className="nav-actions">
            <a href="/login" className="login-link">
              Login
            </a>

            <a href="/register" className="register-button">
              Register <ArrowRight size={16} />
            </a>
          </div>

          <button
            type="button"
            className="mobile-menu"
            aria-label="Open menu"
          >
            <Menu />
          </button>

        </div>
      </nav>

      {/* HERO SECTION */}

      <section className="hero" id="home">
        <div className="hero-container">

          <div className="hero-content">

            <div className="hero-label">
              <span className="live-dot"></span>
              DIGITAL SCHOLARSHIP PLATFORM
            </div>

            <h1>
              Empower Your
              <span> Education.</span>
              <br />
              Shape Your Future.
            </h1>

            <p>
              Discover scholarship opportunities, submit applications
              online, upload documents and track your application
              status — all in one secure platform.
            </p>

            <div className="hero-buttons">

              <a href="/register" className="primary-button">
                Apply for Scholarship
                <ArrowRight size={18} />
              </a>

              <a href="#about" className="secondary-button">
                Explore More
                <ChevronRight size={18} />
              </a>

            </div>

            <div className="hero-trust">

              <div className="trust-icon">
                <ShieldCheck size={20} />
              </div>

              <div>
                <strong>Secure & Transparent</strong>
                <small>Your application journey, simplified.</small>
              </div>

            </div>

          </div>

          <div className="hero-visual">

            <div className="visual-circle circle-one"></div>
            <div className="visual-circle circle-two"></div>

            <div className="education-card">

              <div className="education-card-top">

                <div className="card-icon">
                  <GraduationCap size={28} />
                </div>

                <span className="status-pill">
                  Online Portal
                </span>

              </div>

              <h3>Your Education</h3>
              <h2>Deserves Every Opportunity.</h2>

              <div className="card-divider"></div>

              <div className="card-feature">
                <CheckCircle2 size={18} />
                Easy Online Application
              </div>

              <div className="card-feature">
                <CheckCircle2 size={18} />
                Document Verification
              </div>

              <div className="card-feature">
                <CheckCircle2 size={18} />
                Application Tracking
              </div>

              <div className="card-bottom">
                <span>Scholarship Support</span>
                <Award size={23} />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FEATURES */}

      <section className="features-section" id="about">
        <div className="section-container">

          <div className="section-heading">
            <span className="section-label">
              WHY SCHOLARCONNECT
            </span>

            <h2>
              Everything You Need, <span>In One Place.</span>
            </h2>

            <p>
              A simple and transparent platform designed to make
              scholarship management easier for students.
            </p>
          </div>

          <div className="feature-grid">

            {features.map((feature, index) => (
              <div className="feature-card" key={index}>

                <div className="feature-icon">
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <a href="/register">
                  Learn More <ArrowRight size={15} />
                </a>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* SCHOLARSHIP SECTION */}

      <section className="scholarship-section" id="scholarship">
        <div className="section-container scholarship-layout">

          <div className="scholarship-content">

            <span className="section-label">
              SCHOLARSHIP OPPORTUNITY
            </span>

            <h2>
              Invest in Your
              <span> Educational Journey.</span>
            </h2>

            <p>
              Explore the postgraduate scholarship scheme and check
              its eligibility requirements before applying.
            </p>

            <div className="scholarship-details">

              <div>
                <Landmark size={21} />
                <span>Postgraduate Education</span>
              </div>

              <div>
                <Users size={21} />
                <span>Eligible Categories as per Scheme</span>
              </div>

              <div>
                <BookOpen size={21} />
                <span>Eligible Courses as per Scheme</span>
              </div>

            </div>

            <a href="/scholarships" className="primary-button">
              View Scholarship Details
              <ArrowRight size={17} />
            </a>

          </div>

          <div className="scholarship-highlight">

            <div className="highlight-icon">
              <Award size={32} />
            </div>

            <span>FEATURED SCHEME</span>

            <h3>Postgraduate Student Scholarship 2026</h3>

            <div className="highlight-divider"></div>

            <div className="highlight-info">
              <span>Course</span>
              <strong>All PG eligible courses</strong>
            </div>

            <div className="highlight-info">
              <span>Category</span>
              <strong>As defined by scholarship scheme</strong>
            </div>

            <div className="highlight-info">
              <span>Application period</span>
              <strong>Check official scheme dates</strong>
            </div>

            <a href="/scholarships">
              Explore Scheme <ArrowRight size={16} />
            </a>

          </div>

        </div>
      </section>

      {/* PROCESS */}

      <section className="process-section" id="process">
        <div className="section-container">

          <div className="section-heading">

            <span className="section-label">
              SIMPLE PROCESS
            </span>

            <h2>
              How to <span>Apply?</span>
            </h2>

            <p>
              Follow these simple steps to complete your scholarship journey.
            </p>

          </div>

          <div className="steps-grid">

            {steps.map((step, index) => (
              <div className="step-card" key={index}>

                <div className="step-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="step-line"></div>

                <h3>{step}</h3>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* DOCUMENTS */}

      <section className="documents-section" id="documents">
        <div className="section-container documents-layout">

          <div className="documents-intro">

            <span className="section-label">
              DOCUMENT CHECKLIST
            </span>

            <h2>
              Keep Your Documents
              <span> Ready.</span>
            </h2>

            <p>
              Prepare the documents required by the selected scholarship
              scheme before submitting your application.
            </p>

            <div className="document-note">
              <LockKeyhole size={20} />

              <span>
                Upload documents through your secure student account.
              </span>
            </div>

          </div>

          <div className="document-list">

            {documents.map((document, index) => (
              <div className="document-item" key={index}>
                <CheckCircle2 size={18} />
                <span>{document}</span>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* CTA */}

      <section className="cta-section">
        <div className="cta-container">

          <div>
            <span>YOUR FUTURE STARTS HERE</span>

            <h2>
              Take the First Step Towards Your Dreams.
            </h2>

            <p>
              Create your account and explore available scholarship opportunities.
            </p>
          </div>

          <a href="/register" className="cta-button">
            Get Started <ArrowRight size={18} />
          </a>

        </div>
      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-bottom">
          <p>Project Developed by Manesh Vedpathak</p>
          <p>Designed for a better educational future.</p>
        </div>

      </footer>

    </div>
  );
}

export default App;