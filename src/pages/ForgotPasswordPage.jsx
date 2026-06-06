// =====================================================
// ForgotPasswordPage.jsx
// Maps to: POST /api/auth/forgot_password?email=xxx
// Flow: Finds user → generates UUID token → sets 15min expiry
//       → calls EmailService.sendResetPasswordEmail()
// Response: "Reset email sent over on your email" (plain text)
// =====================================================

import { useState } from "react";
import { forgotPassword } from "../api/authApi";

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      // email sent as @RequestParam (not body)
      const msg = await forgotPassword(email);
      setStatus({ type: "ok", msg });
      setSent(true);
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => onNavigate("/login")} style={styles.back}>← Back to login</button>

        {!sent ? (
          <>
            {/* Lock icon */}
            <div style={styles.iconWrap}>
              <span style={styles.icon}>🔑</span>
            </div>
            <h2 style={styles.title}>Forgot Password?</h2>
            <p style={styles.sub}>
              Enter your registered email. The backend will generate a{" "}
              <code style={styles.code}>UUID</code> reset token valid for{" "}
              <strong style={styles.highlight}>15 minutes</strong> and email you a reset link.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>Official Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@company.com"
                required
                style={styles.input}
              />

              {status.msg && (
                <div style={status.type === "ok" ? styles.ok : styles.err}>
                  {status.msg}
                </div>
              )}

              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>


          </>
        ) : (
          // Success state
          <div style={styles.successState}>
            <div style={styles.bigIcon}>📬</div>
            <h2 style={styles.title}>Check Your Inbox</h2>
            <p style={styles.sub}>
              A password reset link has been sent to <strong style={styles.highlight}>{email}</strong>.
              The link contains a UUID token and expires in <strong style={styles.highlight}>15 minutes</strong>.
            </p>
            <div style={styles.tokenNote}>
              <div style={styles.tokenNoteTitle}>What the reset link looks like:</div>
              <code style={styles.tokenLink}>
                http://localhost:7676/auth/reset-password?token=<span style={{ color: "#7fffb2" }}>{"<UUID>"}</span>
              </code>
            </div>
            <button onClick={() => onNavigate("/reset")} style={styles.btn}>
              Enter Reset Token →
            </button>
            <button onClick={() => { setSent(false); setEmail(""); }} style={styles.retryBtn}>
              Try a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ n, text, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: color, color: "#000", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
      <code style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{text}</code>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 },
  card: { width: "100%", maxWidth: 500, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "36px 36px 28px" },
  back: { background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 28, display: "block" },
  iconWrap: { width: 60, height: 60, borderRadius: "50%", background: "rgba(127,255,178,0.1)", border: "1px solid rgba(127,255,178,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  icon: { fontSize: 28 },
  bigIcon: { fontSize: 56, textAlign: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 10 },
  sub: { color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 },
  code: { background: "rgba(127,255,178,0.1)", color: "#7fffb2", padding: "1px 6px", borderRadius: 4, fontSize: 13 },
  highlight: { color: "#7fffb2" },
  form: { display: "flex", flexDirection: "column", marginBottom: 28 },
  label: { fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 15, marginBottom: 16, outline: "none" },
  ok: { background: "rgba(127,255,178,0.1)", border: "1px solid #7fffb2", borderRadius: 8, padding: "11px 14px", color: "#7fffb2", fontSize: 13, marginBottom: 16 },
  err: { background: "rgba(255,80,80,0.1)", border: "1px solid #ff5050", borderRadius: 8, padding: "11px 14px", color: "#ff5050", fontSize: 13, marginBottom: 16 },
  btn: { background: "linear-gradient(135deg, #7fffb2, #00e676)", color: "#0a0a0f", fontWeight: 800, fontSize: 14, border: "none", borderRadius: 10, padding: "13px", cursor: "pointer" },
  explainer: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 18px", marginBottom: 24 },
  explainerTitle: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 },
  steps: {},
  successState: { textAlign: "center" },
  tokenNote: { background: "rgba(127,255,178,0.05)", border: "1px solid rgba(127,255,178,0.15)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, textAlign: "left" },
  tokenNoteTitle: { fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  tokenLink: { fontSize: 12, color: "rgba(255,255,255,0.5)", wordBreak: "break-all", lineHeight: 1.6 },
  retryBtn: { display: "block", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 13, marginTop: 14, textDecoration: "underline" },
  endpointHint: { marginTop: 24, display: "flex", alignItems: "center", gap: 10, opacity: 0.35, flexWrap: "wrap" },
  methodBadge: { background: "#7fffb2", color: "#0a0a0f", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4, flexShrink: 0 },
  ep: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
};
