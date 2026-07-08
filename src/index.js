import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import EmailSendPage from "./pages/EmailSendPage";
import UserProfilePage from "./pages/UserProfilePage";
import IssuesPage from "./pages/IssuesPage";
import SprintsPage from "./pages/SprintsPage";

// ─────────────────────────────────────────
// useNavigate() = React Router hook
// Replaces our manual onNavigate prop system
// Now URL changes when you switch pages
// ─────────────────────────────────────────
function App() {
  const navigate = useNavigate();

  return (
      <Routes>
        <Route path="/"          element={<RegisterPage    onNavigate={navigate} />} />
        <Route path="/register"  element={<RegisterPage    onNavigate={navigate} />} />
        <Route path="/login"     element={<LoginPage       onNavigate={navigate} />} />
        <Route path="/forgot"    element={<ForgotPasswordPage onNavigate={navigate} />} />
        <Route path="/reset"     element={<ResetPasswordPage  onNavigate={navigate} />} />
        <Route path="/dashboard" element={<DashboardPage   onNavigate={navigate} />} />
        <Route path="/email"     element={<EmailSendPage   onNavigate={navigate} />} />
        <Route path="/profile"   element={<UserProfilePage onNavigate={navigate} />} />
        <Route path="/issues"    element={<IssuesPage      onNavigate={navigate} />} />
        <Route path="/sprints"   element={<SprintsPage     onNavigate={navigate} />} />
      </Routes>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);