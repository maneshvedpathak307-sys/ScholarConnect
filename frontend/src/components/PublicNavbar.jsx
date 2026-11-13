import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  Menu,
  X
} from "lucide-react";

function PublicNavbar({ activePage = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const links = [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "Scholarships", href: "/#scholarship" },
    { label: "How It Works", href: "/#process" },
    { label: "Documents", href: "/#documents" }
  ];

  return (
    <header className="public-navbar">

      <div className="public-nav-container">

        <Link
          to="/"
          className="public-brand"
          onClick={closeMenu}
        >
          <div className="public-brand-icon">
            <GraduationCap size={26} />
          </div>

          <div className="public-brand-text">
            <h2>
              Scholar<span>Connect</span>
            </h2>
            <small>Scholarship Management Portal</small>
          </div>
        </Link>

        <nav className={`public-nav-links ${menuOpen ? "open" : ""}`}>

          {links.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}

          <div className="public-mobile-actions">

            <Link
              to="/login"
              className={activePage === "login" ? "active" : ""}
              onClick={closeMenu}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="public-register-button"
              onClick={closeMenu}
            >
              Register <ArrowRight size={16} />
            </Link>

          </div>

        </nav>

        <div className="public-nav-actions">

          <Link
            to="/login"
            className={`public-login-link ${
              activePage === "login" ? "active" : ""
            }`}
          >
            Login
          </Link>

          <Link
            to="/register"
            className="public-register-button"
          >
            Register <ArrowRight size={16} />
          </Link>

        </div>

        <button
          type="button"
          className="public-mobile-menu"
          onClick={() => setMenuOpen(current => !current)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

      </div>

    </header>
  );
}

export default PublicNavbar;