// =====================================================
// ResetPasswordPage.jsx
// Maps to: POST /api/auth/reset_password?token=xxx&newPassword=xxx
// Flow: Finds user by resetToken → checks expiry → BCrypt encodes
//       → clears resetToken & resetTokenExpiry → saves
// Response: "Password Reset successful" (plain text)
// =====================================================

import { useState } from "react";
import { resetPassword } from "../api/authApi";

export default function ResetPasswordPage({ onNavigate }) {
  const [form, setForm] = useState({ token: "", newPassword: "", confirm: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const passwordsMatch = form.newPassword === form.confirm && form.confirm !== "";
  const strength = getStrength(form.newPassword);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!passwordsMatch) return setStatus({ type: "err", msg: "Passwords do not match" });
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      // token + newPassword both sent as @RequestParam (not body)
      const msg = await resetPassword(form.token, form.newPassword);
      setStatus({ type: "ok", msg });
      setDone(true);
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => onNavigate("/forgot")} style={styles.back}>← Back</button>

        {!done ? (
          <>
            <div style={styles.iconWrap}><span style={styles.icon}>🛡</span></div>
            <h2 style={styles.title}>Reset Password</h2>
            <p style={styles.sub}>
              Paste the <code style={styles.code}>UUID token</code> from your email and choose a new password.
              The token expires 15 minutes after it was sent.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* token — stored in UserAuth.resetToken, found via findByResetToken() */}
              <div style={styles.field}>
                <label style={styles.label}>Reset Token (from email)</label>
                <input
                  name="token"
                  value={form.token}
                  onChange={handleChange}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  required
                  style={styles.input}
                />
                <p style={styles.hint}>
                  Backend calls: <code style={styles.inlineCode}>findByResetToken(token)</code>
                </p>
              </div>

              {/* newPassword — will be BCrypt encoded before saving */}
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <div style={styles.passWrap}>
                  <input
                    name="newPassword"
                    type={showPass ? "text" : "password"}
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Strong password"
                    required
                    style={styles.input}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eye}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
                {/* Password strength meter */}
                {form.newPassword && (
                  <div style={styles.strengthWrap}>
                    <div style={{ ...styles.strengthBar, width: `${strength.pct}%`, background: strength.color }} />
                    <span style={{ color: strength.color, fontSize: 11 }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                  style={{
                    ...styles.input,
                    borderColor: form.confirm
                      ? passwordsMatch ? "rgba(127,255,178,0.4)" : "rgba(255,80,80,0.4)"
                      : "rgba(255,255,255,0.1)"
                  }}
                />
                {form.confirm && (
                  <span style={{ fontSize: 12, color: passwordsMatch ? "#7fffb2" : "#ff5050" }}>
                    {passwordsMatch ? "✓ Passwords match" : "✕ Passwords do not match"}
                  </span>
                )}
              </div>

              {status.msg && (
                <div style={status.type === "ok" ? styles.ok : styles.err}>{status.msg}</div>
              )}

              <button type="submit" disabled={loading || !passwordsMatch} style={{
                ...styles.btn,
                opacity: (!passwordsMatch) ? 0.5 : 1,
              }}>
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>


          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <h2 style={styles.title}>Password Reset!</h2>
            <p style={styles.sub}>Your password has been updated. The reset token has been cleared from the database.</p>
            <button onClick={() => onNavigate("/login")} style={styles.btn}>Go to Login →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function getStrength(pw) {
  if (!pw) return { pct: 0, color: "#333", label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { pct: 10, color: "#ff5050", label: "Very weak" },
    { pct: 35, color: "#ff9f50", label: "Weak" },
    { pct: 65, color: "#ffdb50", label: "Fair" },
    { pct: 85, color: "#7fffb2", label: "Strong" },
    { pct: 100, color: "#00e676", label: "Very strong" },
  ];
  return map[score] || map[0];
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 },
  card: { width: "100%", maxWidth: 500, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "36px" },
  back: { background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 24, display: "block" },
  iconWrap: { width: 56, height: 56, borderRadius: "50%", background: "rgba(127,255,178,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  icon: { fontSize: 26 },
  title: { fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 10 },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 },
  code: { background: "rgba(127,255,178,0.1)", color: "#7fffb2", padding: "1px 6px", borderRadius: 4, fontSize: 13 },
  inlineCode: { color: "#60afff", fontSize: 11, background: "rgba(96,175,255,0.1)", padding: "1px 5px", borderRadius: 3 },
  form: { display: "flex", flexDirection: "column" },
  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border .2s" },
  passWrap: { position: "relative" },
  eye: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 },
  strengthWrap: { display: "flex", alignItems: "center", gap: 10, marginTop: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden", height: 4, position: "relative" },
  strengthBar: { height: "100%", borderRadius: 4, transition: "width .3s, background .3s", position: "absolute", left: 0 },
  hint: { color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 6 },
  ok: { background: "rgba(127,255,178,0.1)", border: "1px solid #7fffb2", borderRadius: 8, padding: "11px", color: "#7fffb2", fontSize: 13, marginBottom: 14 },
  err: { background: "rgba(255,80,80,0.1)", border: "1px solid #ff5050", borderRadius: 8, padding: "11px", color: "#ff5050", fontSize: 13, marginBottom: 14 },
  btn: { background: "linear-gradient(135deg, #7fffb2, #00e676)", color: "#0a0a0f", fontWeight: 800, fontSize: 14, border: "none", borderRadius: 10, padding: "13px", cursor: "pointer", transition: "opacity .2s" },
  explainer: { marginTop: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" },
  explainerTitle: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  epRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 20, opacity: 0.35, flexWrap: "wrap" },
  epBadge: { background: "#7fffb2", color: "#0a0a0f", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4, flexShrink: 0 },
  ep: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
};
