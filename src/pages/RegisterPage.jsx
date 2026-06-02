// =====================================================
// RegisterPage.jsx
// Maps to: POST /api/auth/register
// DTO: RegisterRequestDTO { userName, userOfficialEmail, password, role }
// Roles (from ENUM/Role.java): ADMIN | MANAGER | DEVELOPER | TESTER
// Response: AuthResponseDTO { token, message }
// =====================================================

import { useState } from "react";
import { registerUser } from "../api/authApi";

const ROLES = ["ADMIN", "MANAGER", "DEVELOPER", "TESTER"];

// Permission map — mirrors RoleBasedPermission.java
const ROLE_PERMISSIONS = {
  ADMIN: ["ISSUE_VIEW","ISSUE_CREATE","ISSUE_EDIT","ISSUE_DELETE","COMMENT_ADD","COMMENT_DELETE","USER_MANAGE"],
  MANAGER: ["ISSUE_VIEW","ISSUE_CREATE","ISSUE_EDIT","COMMENT_ADD"],
  DEVELOPER: ["ISSUE_VIEW","ISSUE_EDIT","COMMENT_ADD"],
  TESTER: ["ISSUE_VIEW","COMMENT_ADD"],
};

export default function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({
    userName: "",
    userOfficialEmail: "",
    password: "",
    role: "DEVELOPER",
  });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", msg: "" });
    setLoading(true);
    try {
      // Sends RegisterRequestDTO to Spring Boot
      const data = await registerUser(form);
      // AuthResponseDTO returns token — store it for authenticated requests
      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("user_role", form.role);
      localStorage.setItem("user_email", form.userOfficialEmail);
      setStatus({ type: "ok", msg: data.message || "Registered successfully!" });
      setTimeout(() => onNavigate("dashboard"), 1200);
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      {/* Left Panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>⬡</span>
            <span style={styles.brandName}>TaskForge</span>
          </div>
          <h1 style={styles.headline}>Build.<br />Track.<br />Ship.</h1>
          <p style={styles.sub}>A task management system with role-based access control. Register to get your JWT token and start managing issues.</p>

          {/* Live Role Preview — teaches what roles do */}
          <div style={styles.roleBox}>
            <div style={styles.roleBoxTitle}>Role Preview: <strong>{form.role}</strong></div>
            <div style={styles.permGrid}>
              {ROLE_PERMISSIONS[form.role].map(p => (
                <span key={p} style={styles.permBadge}>{p.replace("_", " ")}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.formTitle}>Create Account</h2>
          <p style={styles.formSub}>
            Already have an account?{" "}
            <button onClick={() => onNavigate("login")} style={styles.link}>Sign in</button>
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Full Name</label>
            <input
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              required
              style={styles.input}
            />

            <label style={styles.label}>Official Email</label>
            <input
              name="userOfficialEmail"
              type="email"
              value={form.userOfficialEmail}
              onChange={handleChange}
              placeholder="rahul@company.com"
              required
              style={styles.input}
            />

            <label style={styles.label}>Password</label>
            <div style={styles.passWrap}>
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
                style={{ ...styles.input, marginBottom: 0 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>

            <label style={styles.label}>Role</label>
            <div style={styles.roleGrid}>
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  style={{
                    ...styles.roleBtn,
                    ...(form.role === r ? styles.roleBtnActive : {}),
                  }}
                >
                  <span style={styles.roleIcon}>{roleIcon(r)}</span>
                  {r}
                </button>
              ))}
            </div>

            {status.msg && (
              <div style={status.type === "ok" ? styles.successBox : styles.errBox}>
                {status.msg}
              </div>
            )}

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Registering…" : "Register & Get Token →"}
            </button>
          </form>

          {/* Backend endpoint hint for learning */}
          <div style={styles.endpointHint}>
            <span style={styles.method}>POST</span>
            <code style={styles.endpoint}>/api/auth/register</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function roleIcon(r) {
  return { ADMIN: "👑", MANAGER: "📋", DEVELOPER: "💻", TESTER: "🔬" }[r];
}

const styles = {
  wrap: { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#0a0a0f" },
  left: { width: "45%", background: "linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0f1a0f 100%)", display: "flex", alignItems: "center", padding: "60px", position: "relative", overflow: "hidden" },
  leftInner: { position: "relative", zIndex: 1 },
  brand: { display: "flex", alignItems: "center", gap: 10, marginBottom: 60 },
  brandIcon: { fontSize: 28, color: "#7fffb2" },
  brandName: { fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: 2, textTransform: "uppercase" },
  headline: { fontSize: 64, fontWeight: 900, color: "#fff", lineHeight: 1.05, margin: "0 0 24px", fontFamily: "'Playfair Display', serif" },
  sub: { fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 340, marginBottom: 40 },
  roleBox: { background: "rgba(127,255,178,0.05)", border: "1px solid rgba(127,255,178,0.15)", borderRadius: 12, padding: "18px 20px" },
  roleBoxTitle: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  permGrid: { display: "flex", flexWrap: "wrap", gap: 6 },
  permBadge: { background: "rgba(127,255,178,0.12)", color: "#7fffb2", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, letterSpacing: 0.5 },
  right: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 60px" },
  card: { width: "100%", maxWidth: 480 },
  formTitle: { fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 8 },
  formSub: { color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 36 },
  form: { display: "flex", flexDirection: "column" },
  label: { fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  input: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 15, marginBottom: 20, outline: "none", transition: "border .2s" },
  passWrap: { position: "relative", marginBottom: 20 },
  eyeBtn: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 },
  roleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 },
  roleBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .2s", display: "flex", alignItems: "center", gap: 8 },
  roleBtnActive: { background: "rgba(127,255,178,0.12)", border: "1px solid #7fffb2", color: "#7fffb2" },
  roleIcon: { fontSize: 18 },
  submitBtn: { background: "linear-gradient(135deg, #7fffb2, #00e676)", color: "#0a0a0f", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 10, padding: "15px", cursor: "pointer", marginTop: 8, letterSpacing: 0.5 },
  successBox: { background: "rgba(127,255,178,0.1)", border: "1px solid #7fffb2", borderRadius: 8, padding: "12px 16px", color: "#7fffb2", fontSize: 14, marginBottom: 16 },
  errBox: { background: "rgba(255,80,80,0.1)", border: "1px solid #ff5050", borderRadius: 8, padding: "12px 16px", color: "#ff5050", fontSize: 14, marginBottom: 16 },
  link: { background: "none", border: "none", color: "#7fffb2", cursor: "pointer", fontSize: 14, textDecoration: "underline", padding: 0 },
  endpointHint: { marginTop: 28, display: "flex", alignItems: "center", gap: 10, opacity: 0.4 },
  method: { background: "#7fffb2", color: "#0a0a0f", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4 },
  endpoint: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
};
