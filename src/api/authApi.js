// =====================================================
// API SERVICE — maps to Spring Boot backend endpoints
// Base URL: http://localhost:7676
// =====================================================

const BASE_URL = "http://localhost:7676";

// Helper: reads JWT token from localStorage
function getToken() {
  return localStorage.getItem("jwt_token");
}

// Helper: attaches Authorization header for protected routes
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ─── POST /api/auth/register ───────────────────────
// Body: { userName, userOfficialEmail, password, role }
// Roles: ADMIN | MANAGER | DEVELOPER | TESTER
export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // returns { token, message }
}

// ─── POST /api/auth/login ──────────────────────────
// Body: { userOfficialEmail, password }
export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text(); // returns "Login Successful"
}

// ─── POST /api/auth/forgot_password?email= ─────────
// Sends reset link to email
export async function forgotPassword(email) {
  const res = await fetch(
    `${BASE_URL}/api/auth/forgot_password?email=${encodeURIComponent(email)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

// ─── POST /api/auth/reset_password?token=&newPassword= ─
export async function resetPassword(token, newPassword) {
  const res = await fetch(
    `${BASE_URL}/api/auth/reset_password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

// ─── POST /api/auth/loggedOut ──────────────────────
// Requires Authorization: Bearer <token> header
export async function logoutUser() {
  const res = await fetch(`${BASE_URL}/api/auth/loggedOut`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

// ─── POST /emailsend ──────────────────────────────
// Body: { recepientEmail, subject, body }
export async function sendEmail(data) {
  const res = await fetch(`${BASE_URL}/emailsend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}
