import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  LogOut,
  FileBarChart
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Shared admin navigation.
 * variant="admin" uses the dashboard/applications sidebar classes.
 * variant="management" uses the reports/scholarships/students classes.
 */
export default function AdminSidebar({ activePage, variant = "management" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminStyle = variant === "admin";

  const styles = isAdminStyle
    ? {
        sidebar: "admin-sidebar",
        brand: "admin-brand",
        brandIcon: "admin-brand-icon",
        menuLabel: "admin-menu-label",
        item: "admin-menu-item",
        bottom: "admin-sidebar-bottom",
        logout: "admin-logout"
      }
    : {
        sidebar: "management-sidebar",
        brand: "management-brand",
        brandIcon: "management-brand-icon",
        menuLabel: "management-menu-label",
        item: "management-menu-item",
        bottom: "management-sidebar-bottom",
        logout: ""
      };

  const links = [
    { key: "dashboard", label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { key: "applications", label: "Applications", to: "/admin/applications", icon: FileText },
    { key: "students", label: "Students", to: "/admin/students", icon: Users },
    { key: "scholarships", label: "Scholarships", to: "/admin/scholarships", icon: GraduationCap },
    { key: "reports", label: "Reports", to: "/admin/reports", icon: FileBarChart }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <GraduationCap size={27} />
        </div>
        <div>
          <h2>ScholarConnect</h2>
          <span>Admin Portal</span>
        </div>
      </div>

      <div className={styles.menuLabel}>MAIN MENU</div>

      {links.map(({ key, label, to, icon: Icon }) => {
        const active = activePage
          ? activePage === key
          : location.pathname === to;

        return (
          <Link
            key={key}
            to={to}
            className={`${styles.item}${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={19} />
            {isAdminStyle ? <span>{label}</span> : label}
          </Link>
        );
      })}

      <div className={styles.bottom}>
        <button
          type="button"
          onClick={handleLogout}
          className={styles.logout || undefined}
        >
          <LogOut size={19} />
          {isAdminStyle ? <span>Logout</span> : "Logout"}
        </button>
      </div>
    </aside>
  );
}
