// =====================================================
// EmailSendPage.jsx
// Maps to: POST /emailsend (EmailLogController.java)
// Body: EmailLog { recepientEmail, subject, body }
// Note: Uses MimeMessageHelper (HTML emails supported)
//       Saves EmailLog to DB via EmailLogRepository
// Response: "Email sent succesfull" | "Email sending failed"
// =====================================================

import { useState } from "react";
import { sendEmail } from "../api/authApi";

const TEMPLATES = [
  { label: "Welcome", subject: "Welcome to TaskForge!", body: "<h2>Welcome!</h2><p>You've been added to the task management system. Your account is ready.</p>" },
  { label: "Task Assigned", subject: "New Task Assigned to You", body: "<h2>Task Update</h2><p>A new issue has been assigned to you. Please log in to view details.</p>" },
  { label: "Reminder", subject: "Deadline Reminder", body: "<h2>Reminder</h2><p>This is a friendly reminder about an upcoming deadline.</p>" },
];

export default function EmailSendPage({ onNavigate }) {
  const [form, setForm] = useState({ recepientEmail: "", subject: "", body: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [htmlMode, setHtmlMode] = useState(true);
  const [sentLog, setSentLog] = useState([]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function loadTemplate(t) {
    setForm({ ...form, subject: t.subject, body: t.body });
    setHtmlMode(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      // EmailLog entity fields: recepientEmail, subject, body
      const msg = await sendEmail(form);
      const success = msg.toLowerCase().includes("success");
      setStatus({ type: success ? "ok" : "err", msg });
      setSentLog(prev => [{ ...form, success, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
      if (success) setForm({ recepientEmail: "", subject: "", body: "" });
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => onNavigate("/dashboard")} style={styles.back}>← Dashboard</button>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>⬡</span>
          <span style={styles.brandName}>TaskForge</span>
        </div>
        <div />
      </div>

      <div style={styles.body}>
        {/* Left — Form */}
        <div style={styles.left}>
          <h2 style={styles.title}>Send Email</h2>
          <p style={styles.sub}>
            Uses <code style={styles.code}>JavaMailSender</code> + <code style={styles.code}>MimeMessageHelper</code>. HTML emails supported.
            Every send is logged to the <code style={styles.code}>email-log</code> table.
          </p>

          {/* Quick templates */}
          <div style={styles.templatesRow}>
            <span style={styles.templatesLabel}>Templates:</span>
            {TEMPLATES.map(t => (
              <button key={t.label} onClick={() => loadTemplate(t)} style={styles.templateBtn}>{t.label}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* recepientEmail — maps to EmailLog.recepientEmail (note: typo in entity is intentional) */}
            <div style={styles.field}>
              <label style={styles.label}>
                To (recepientEmail)
                <span style={styles.fieldNote}> → EmailLog.recepientEmail</span>
              </label>
              <input
                name="recepientEmail"
                type="email"
                value={form.recepientEmail}
                onChange={handleChange}
                placeholder="recipient@company.com"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Subject
                <span style={styles.fieldNote}> → EmailLog.subject</span>
              </label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Email subject line"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <div style={styles.bodyHeader}>
                <label style={styles.label}>
                  Body (HTML supported)
                  <span style={styles.fieldNote}> → EmailLog.body (length=5000)</span>
                </label>
                <div style={styles.modeToggle}>
                  <button type="button" onClick={() => setHtmlMode(false)} style={{ ...styles.modeBtn, ...((!htmlMode) ? styles.modeBtnActive : {}) }}>Raw</button>
                  <button type="button" onClick={() => setHtmlMode(true)} style={{ ...styles.modeBtn, ...(htmlMode ? styles.modeBtnActive : {}) }}>HTML</button>
                </div>
              </div>
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                placeholder={htmlMode ? "<h1>Hello!</h1><p>Your message here...</p>" : "Plain text message"}
                required
                rows={8}
                style={styles.textarea}
              />
              {/* Live HTML preview */}
              {htmlMode && form.body && (
                <div style={styles.preview}>
                  <div style={styles.previewLabel}>Preview</div>
                  <div
                    style={styles.previewBody}
                    dangerouslySetInnerHTML={{ __html: form.body }}
                  />
                </div>
              )}
            </div>

            {status.msg && (
              <div style={status.type === "ok" ? styles.ok : styles.err}>
                {status.msg}
              </div>
            )}

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Sending via JavaMailSender…" : "📧 Send Email"}
            </button>
          </form>
        </div>

        {/* Right — Info + Logs */}
        <div style={styles.right}>
          {/* Backend flow */}
          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>⚙ EmailService.sendEmail() flow</div>
            <div style={styles.flowSteps}>
              <FlowStep n="1" text="MimeMessage → MimeMessageHelper" color="#60afff" />
              <FlowStep n="2" text="helper.setText(body, true) ← HTML=true" color="#7fffb2" />
              <FlowStep n="3" text="mailSender.send(message)" color="#ffb347" />
              <FlowStep n="4" text="sentStatus = true/false" color="#c084fc" />
              <FlowStep n="5" text="new EmailLog(…) → emailLogRepo.save()" color="#f472b6" />
            </div>
          </div>

          {/* EmailLog entity */}
          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>🗄 EmailLog Entity (email-log table)</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
              <FieldRow name="id" type="Long" note="Auto-generated" />
              <FieldRow name="recepientEmail" type="String" note="To address" />
              <FieldRow name="subject" type="String" note="Email subject" />
              <FieldRow name="body" type="String" note="length=5000" />
              <FieldRow name="sentStatus" type="boolean" note="true if sent" />
              <FieldRow name="sentAt" type="LocalDateTime" note="= LocalDateTime.now()" />
            </div>
          </div>

          {/* Send log */}
          {sentLog.length > 0 && (
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>📋 Recent Sends</div>
              {sentLog.map((log, i) => (
                <div key={i} style={{ ...styles.logRow, borderColor: log.success ? "rgba(127,255,178,0.1)" : "rgba(255,80,80,0.1)" }}>
                  <span style={{ color: log.success ? "#7fffb2" : "#ff5050" }}>{log.success ? "✓" : "✕"}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 }}>{log.recepientEmail}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{log.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* Endpoint badge */}
          <div style={styles.epRow}>
            <span style={styles.epBadge}>POST</span>
            <code style={styles.ep}>/emailsend</code>
            <span style={styles.epNote}>EmailLogController.java</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ n, text, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: color, color: "#000", fontWeight: 800, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
      <code style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{text}</code>
    </div>
  );
}

function FieldRow({ name, type, note }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <span style={{ color: "#7fffb2", minWidth: 120 }}>{name}</span>
      <span style={{ color: "#60afff", minWidth: 100 }}>{type}</span>
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{note}</span>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#fff" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  back: { background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14 },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  brandIcon: { fontSize: 20, color: "#7fffb2" },
  brandName: { fontSize: 15, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" },
  body: { display: "flex", gap: 32, padding: "36px 40px", maxWidth: 1200, margin: "0 auto" },
  left: { flex: 1 },
  right: { width: 320, flexShrink: 0 },
  title: { fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 },
  code: { background: "rgba(127,255,178,0.1)", color: "#7fffb2", padding: "1px 5px", borderRadius: 4, fontSize: 12 },
  templatesRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  templatesLabel: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 },
  templateBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.6)", fontSize: 12, padding: "4px 12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  form: { display: "flex", flexDirection: "column" },
  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  fieldNote: { color: "rgba(127,255,178,0.4)", textTransform: "none", letterSpacing: 0, fontWeight: 400 },
  input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" },
  bodyHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  modeToggle: { display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: 2, gap: 2 },
  modeBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 11, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  modeBtnActive: { background: "rgba(127,255,178,0.15)", color: "#7fffb2" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, fontFamily: "monospace", outline: "none", resize: "vertical", boxSizing: "border-box" },
  preview: { marginTop: 10, background: "#fff", borderRadius: 10, padding: "14px 18px", maxHeight: 200, overflowY: "auto" },
  previewLabel: { fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  previewBody: { fontSize: 14, color: "#111", lineHeight: 1.6 },
  ok: { background: "rgba(127,255,178,0.1)", border: "1px solid #7fffb2", borderRadius: 8, padding: "11px", color: "#7fffb2", fontSize: 13, marginBottom: 14 },
  err: { background: "rgba(255,80,80,0.1)", border: "1px solid #ff5050", borderRadius: 8, padding: "11px", color: "#ff5050", fontSize: 13, marginBottom: 14 },
  btn: { background: "linear-gradient(135deg, #7fffb2, #00e676)", color: "#0a0a0f", fontWeight: 800, fontSize: 14, border: "none", borderRadius: 10, padding: "13px", cursor: "pointer" },
  infoCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 },
  infoTitle: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 },
  flowSteps: {},
  logRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid", marginBottom: 4 },
  epRow: { display: "flex", alignItems: "center", gap: 8, opacity: 0.35 },
  epBadge: { background: "#7fffb2", color: "#0a0a0f", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4 },
  ep: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  epNote: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
};
