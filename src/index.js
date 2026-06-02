import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import EmailSendPage from "./pages/EmailSendPage";

function App() {
  const [page, setPage] = useState("register");

  const navigate = (p) => setPage(p);

  return (
    <>
      {page === "register"  && <RegisterPage       onNavigate={navigate} />}
      {page === "login"     && <LoginPage           onNavigate={navigate} />}
      {page === "forgot"    && <ForgotPasswordPage  onNavigate={navigate} />}
      {page === "reset"     && <ResetPasswordPage   onNavigate={navigate} />}
      {page === "dashboard" && <DashboardPage       onNavigate={navigate} />}
      {page === "email"     && <EmailSendPage       onNavigate={navigate} />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);