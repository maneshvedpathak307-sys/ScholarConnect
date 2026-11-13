import React from "react";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Error from "./pages/Error";
import ForgotPassword from "./pages/ForgotPassword";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Applications from "./pages/admin/Applications";
import Students from "./pages/admin/Students";
import Scholarships from "./pages/admin/Scholarships";
import Reports from "./pages/admin/Reports";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentScholarships from "./pages/student/StudentScholarships";
import MyApplications from "./pages/student/MyApplications";
import ApplyScholarship from "./pages/student/ApplyScholarship";
import Notifications from "./pages/student/Notifications";
import Profile from "./pages/student/Profile";

function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <Routes>

          {/* PUBLIC ROUTES */}

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/unauthorized"
            element={<Error />}
          />

          {/* STUDENT ROUTES */}

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/scholarships"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentScholarships />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/applications"
            element={
              <ProtectedRoute role="STUDENT">
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/apply/:scholarshipId"
            element={
              <ProtectedRoute role="STUDENT">
                <ApplyScholarship />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute role="STUDENT">
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/profile"
            element={
              <ProtectedRoute role="STUDENT">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute role="ADMIN">
                <Applications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/students"
            element={
              <ProtectedRoute role="ADMIN">
                <Students />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/scholarships"
            element={
              <ProtectedRoute role="ADMIN">
                <Scholarships />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute role="ADMIN">
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* NOT FOUND */}

          <Route path="*" element={<Error />} />

        </Routes>

      </BrowserRouter>

    </AuthProvider>
  );
}

export default App;