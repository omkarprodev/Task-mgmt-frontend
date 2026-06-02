// =====================================================
// LoginPage.jsx
// Maps to: POST /api/auth/login
// DTO: LoginRequestDTO { userOfficialEmail, password }
// Response: "Login Successful" (plain text)
// Note: Backend validates credentials + BCrypt password
// =====================================================

import { useState } from "react";
import { loginUser } from "../api/authApi";

export default function LoginPage({ onNavigate }) {
  const [form, setForm] = useState({ userOfficialEmail: "", password: "" });
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
      // Sends LoginRequestDTO — backend checks BCrypt hash
      const msg = await loginUser(form);
      setStatus({ type: "ok", msg });
      localStorage.setItem("user_email", form.userOfficialEmail);
      setTimeout(() => onNavigate("dashboard"), 1000);
    } catch (err) {
      setStatus({ type: "err", msg: err.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Decorative background grid */}
      <div style={styles.gridBg} />

      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand}>
          <span style={styles.brandGlyph}>⬡</span>
          <span style={styles.brandText}>TaskForge</span>
        </div>

        <div style={styles.card}>
          {/* Top accent bar */}
          <div style={styles.accentBar} />

          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>Welcome back. Enter your credentials to access your dashboard.</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* userOfficialEmail — matches LoginRequestDTO field */}
            <div style={styles.field}>
              <label style={styles.label}>Official Email</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>✉</span>
                <input
                  name="userOfficialEmail"
                  type="email"
                  value={form.userOfficialEmail}
                  onChange={handleChange}
                  placeholder="your@company.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* password — will be checked against BCrypt hash in UserAuthService */}
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  style={{ ...styles.input, paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={styles.eyeBtn}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("forgot")}
              style={styles.forgotLink}
            >
              Forgot password?
            </button>

            {status.msg && (
              <div style={status.type === "ok" ? styles.ok : styles.err}>
                {status.type === "ok" ? "✓ " : "✕ "}{status.msg}
              </div>
            )}

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? (
                <span>Authenticating…</span>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>

          <div style={styles.divider}><span>or</span></div>

          <button onClick={() => onNavigate("register")} style={styles.registerBtn}>
            Create new account
          </button>
        </div>

        {/* Flow diagram — shows what happens on backend */}
        <div style={styles.flowBox}>
          <div style={styles.flowTitle}>🔍 What happens on login</div>
          <div style={styles.flow}>
            <FlowStep color="#7fffb2" label="1" text="UserAuthService.login()" />
            <Arrow />
            <FlowStep color="#60afff" label="2" text="findByUserOfficialEmail()" />
            <Arrow />
            <FlowStep color="#ffb347" label="3" text="BCrypt.matches()" />
            <Arrow />
            <FlowStep color="#ff80ab" label="4" text="JWTUtil.generateToken()" />
          </div>
        </div>

        {/* Endpoint badge */}
        <div style={styles.endpointRow}>
          <span style={styles.methodBadge}>POST</span>
          <code style={styles.endpoint}>/api/auth/login</code>
          <span style={styles.returns}>→ "Login Successful"</span>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ color, label, text }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, color: "#000", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>{label}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", maxWidth: 80, lineHeight: 1.3 }}>{text}</div>
    </div>
  );
}
function Arrow() {
  return <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 20, paddingBottom: 18 }}>→</div>;
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" },
  gridBg: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(127,255,178,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(127,255,178,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  container: { width: "100%", maxWidth: 460, padding: "0 20px", position: "relative", zIndex: 1 },
  brand: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36 },
  brandGlyph: { fontSize: 26, color: "#7fffb2" },
  brandText: { fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: 3, textTransform: "uppercase" },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "36px 36px 28px", backdropFilter: "blur(20px)", position: "relative", overflow: "hidden" },
  accentBar: { position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #7fffb2, #00e676, #7fffb2)" },
  title: { fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 },
  subtitle: { color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 },
  form: { display: "flex", flexDirection: "column", gap: 0 },
  field: { marginBottom: 18 },
  label: { display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 },
  inputWrap: { position: "relative" },
  inputIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.4 },
  input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px 16px 13px 40px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" },
  eyeBtn: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 },
  forgotLink: { background: "none", border: "none", color: "#7fffb2", fontSize: 13, cursor: "pointer", textAlign: "right", marginBottom: 20, padding: 0, textDecoration: "underline" },
  ok: { background: "rgba(127,255,178,0.1)", border: "1px solid #7fffb2", borderRadius: 8, padding: "11px 14px", color: "#7fffb2", fontSize: 13, marginBottom: 16 },
  err: { background: "rgba(255,80,80,0.1)", border: "1px solid #ff5050", borderRadius: 8, padding: "11px 14px", color: "#ff5050", fontSize: 13, marginBottom: 16 },
  btn: { background: "linear-gradient(135deg, #7fffb2, #00e676)", color: "#0a0a0f", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 10, padding: "14px", cursor: "pointer", letterSpacing: 0.5 },
  divider: { textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, margin: "20px 0", position: "relative" },
  registerBtn: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  flowBox: { marginTop: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" },
  flowTitle: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  flow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 },
  endpointRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: "0 4px", opacity: 0.45 },
  methodBadge: { background: "#7fffb2", color: "#0a0a0f", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4 },
  endpoint: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  returns: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
};
