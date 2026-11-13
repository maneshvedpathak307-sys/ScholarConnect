import React from "react";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  User,
  LogOut,
  Bell
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="student-sidebar">

      <div className="student-brand">
        <div className="student-brand-icon">
          <GraduationCap size={27} />
        </div>

        <div>
          <h2>ScholarConnect</h2>
          <span>Student Portal</span>
        </div>
      </div>

      <div className="student-menu-label">MAIN MENU</div>

      <NavLink
        to="/student/dashboard"
        className={({ isActive }) =>
          `student-menu-item ${isActive ? "active" : ""}`
        }
      >
        <LayoutDashboard size={19} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/student/scholarships"
        className={({ isActive }) =>
          `student-menu-item ${isActive ? "active" : ""}`
        }
      >
        <GraduationCap size={19} />
        <span>Browse Scholarships</span>
      </NavLink>

      <NavLink
        to="/student/applications"
        className={({ isActive }) =>
          `student-menu-item ${isActive ? "active" : ""}`
        }
      >
        <FileText size={19} />
        <span>My Applications</span>
      </NavLink>

      <NavLink
        to="/student/notifications"
        className={({ isActive }) =>
          `student-menu-item ${isActive ? "active" : ""}`
        }
      >
        <Bell size={19} />
        <span>Notifications</span>
      </NavLink>

      <NavLink
        to="/student/profile"
        className={({ isActive }) =>
          `student-menu-item ${isActive ? "active" : ""}`
        }
      >
        <User size={19} />
        <span>My Profile</span>
      </NavLink>

      <div className="student-sidebar-bottom">
        <button onClick={handleLogout}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}