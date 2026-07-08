// =====================================================
// SprintsPage.jsx
// Maps to: SprintController.java
//
// NOTE: as currently written, SprintController has no
// class-level path prefix, so these calls hit the app
// root (e.g. "/create_sprint") rather than "/api/sprints/...".
// See sprintApi.js for details.
// =====================================================

import { useState } from "react";
import { createSprint, assignSprintToIssue, startSprint, closeSprint } from "../api/sprintApi";

const emptySprint = {
    sprintName: "",
    sprintGoal: "",
    startDate: "",
    endDate: "",
    projectId: "",
};

export default function SprintsPage({ onNavigate }) {
    const [activeTab, setActiveTab] = useState("create");

    // Create tab
    const [form, setForm] = useState(emptySprint);
    const [createStatus, setCreateStatus] = useState({ type: "", msg: "" });
    const [creating, setCreating] = useState(false);
    const [createdSprint, setCreatedSprint] = useState(null);

    // Manage tab
    const [sprintId, setSprintId] = useState("");
    const [issueId, setIssueId] = useState("");
    const [manageStatus, setManageStatus] = useState({ type: "", msg: "" });
    const [manageResult, setManageResult] = useState(null);
    const [busyAction, setBusyAction] = useState("");

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleCreate(e) {
        e.preventDefault();
        setCreating(true);
        setCreateStatus({ type: "", msg: "" });
        try {
            const payload = {
                ...form,
                projectId: form.projectId ? Number(form.projectId) : null,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
                endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
            };
            const saved = await createSprint(payload);
            setCreatedSprint(saved);
            setCreateStatus({ type: "ok", msg: `Sprint created (id: ${saved.id})` });
            setForm(emptySprint);
        } catch (err) {
            setCreateStatus({ type: "err", msg: err.message });
        } finally {
            setCreating(false);
        }
    }

    async function handleAssign() {
        if (!sprintId || !issueId) return;
        setBusyAction("assign");
        setManageStatus({ type: "", msg: "" });
        try {
            const data = await assignSprintToIssue(sprintId, issueId);
            setManageResult(data);
            setManageStatus({ type: "ok", msg: `Issue ${issueId} assigned to sprint ${sprintId}.` });
        } catch (err) {
            setManageStatus({ type: "err", msg: err.message });
        } finally {
            setBusyAction("");
        }
    }

    async function handleStart() {
        if (!sprintId) return;
        setBusyAction("start");
        setManageStatus({ type: "", msg: "" });
        try {
            const data = await startSprint(sprintId);
            setManageResult(data);
            setManageStatus({ type: "ok", msg: `Sprint ${sprintId} started.` });
        } catch (err) {
            setManageStatus({ type: "err", msg: err.message });
        } finally {
            setBusyAction("");
        }
    }

    async function handleClose() {
        if (!sprintId) return;
        setBusyAction("close");
        setManageStatus({ type: "", msg: "" });
        try {
            const data = await closeSprint(sprintId);
            setManageResult(data);
            setManageStatus({ type: "ok", msg: `Sprint ${sprintId} closed.` });
        } catch (err) {
            setManageStatus({ type: "err", msg: err.message });
        } finally {
            setBusyAction("");
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.topBar}>
                <button style={styles.back} onClick={() => onNavigate("/dashboard")}>← Dashboard</button>
                <div style={styles.brand}>
                    <span style={styles.brandIcon}>⬡</span>
                    <span style={styles.brandName}>TaskForge · Sprints</span>
                </div>
                <div style={{ width: 90 }} />
            </div>

            <div style={styles.tabs}>
                {[
                    { id: "create", label: "Create Sprint" },
                    { id: "manage", label: "Manage Sprint" },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div style={styles.content}>
                <div style={styles.card}>
                    {/* ── Create Tab ─────────────────────────── */}
                    {activeTab === "create" && (
                        <>
                            <h2 style={styles.cardTitle}>Create Sprint</h2>
                            <p style={styles.cardSub}>
                                Calls <code style={styles.code}>POST /create_sprint</code>
                            </p>
                            <form onSubmit={handleCreate} style={styles.form}>
                                <div style={styles.grid}>
                                    <Field label="Sprint Name">
                                        <input
                                            name="sprintName" required value={form.sprintName}
                                            onChange={handleChange} placeholder="Sprint 12"
                                            style={styles.input}
                                        />
                                    </Field>
                                    <Field label="Project ID">
                                        <input
                                            name="projectId" type="number" value={form.projectId}
                                            onChange={handleChange} placeholder="1"
                                            style={styles.input}
                                        />
                                    </Field>
                                    <Field label="Start Date">
                                        <input
                                            name="startDate" type="date" value={form.startDate}
                                            onChange={handleChange}
                                            style={styles.input}
                                        />
                                    </Field>
                                    <Field label="End Date">
                                        <input
                                            name="endDate" type="date" value={form.endDate}
                                            onChange={handleChange}
                                            style={styles.input}
                                        />
                                    </Field>
                                </div>
                                <Field label="Sprint Goal">
                                    <textarea
                                        name="sprintGoal" value={form.sprintGoal}
                                        onChange={handleChange} rows={4}
                                        placeholder="What this sprint aims to deliver…"
                                        style={{ ...styles.input, resize: "vertical" }}
                                    />
                                </Field>

                                {createStatus.msg && (
                                    <div style={createStatus.type === "ok" ? styles.ok : styles.err}>{createStatus.msg}</div>
                                )}

                                <button type="submit" disabled={creating} style={styles.btn}>
                                    {creating ? "Creating…" : "Create Sprint"}
                                </button>
                            </form>

                            {createdSprint && (
                                <div style={styles.payloadBox}>
                                    <div style={styles.payloadTitle}>📦 Raw JSON response from backend</div>
                                    <pre style={styles.payload}>{JSON.stringify(createdSprint, null, 2)}</pre>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Manage Tab ──────────────────────────── */}
                    {activeTab === "manage" && (
                        <>
                            <h2 style={styles.cardTitle}>Manage Sprint</h2>
                            <p style={styles.cardSub}>
                                Assign issues, then <code style={styles.code}>PUT /{"{sprintId}"}/start</code> or{" "}
                                <code style={styles.code}>/close</code>
                            </p>

                            <div style={styles.grid}>
                                <Field label="Sprint ID">
                                    <input
                                        value={sprintId} onChange={e => setSprintId(e.target.value)}
                                        placeholder="e.g. 3" style={styles.input}
                                    />
                                </Field>
                                <Field label="Issue ID (for assignment)">
                                    <input
                                        value={issueId} onChange={e => setIssueId(e.target.value)}
                                        placeholder="e.g. 42" style={styles.input}
                                    />
                                </Field>
                            </div>

                            <div style={styles.actionRow}>
                                <button
                                    onClick={handleAssign}
                                    disabled={!sprintId || !issueId || busyAction !== ""}
                                    style={styles.secondaryBtn}
                                >
                                    {busyAction === "assign" ? "Assigning…" : "Assign Issue → Sprint"}
                                </button>
                                <button
                                    onClick={handleStart}
                                    disabled={!sprintId || busyAction !== ""}
                                    style={styles.secondaryBtn}
                                >
                                    {busyAction === "start" ? "Starting…" : "▶ Start Sprint"}
                                </button>
                                <button
                                    onClick={handleClose}
                                    disabled={!sprintId || busyAction !== ""}
                                    style={{ ...styles.secondaryBtn, borderColor: "rgba(255,80,80,0.3)", color: "#ff8080" }}
                                >
                                    {busyAction === "close" ? "Closing…" : "■ Close Sprint"}
                                </button>
                            </div>

                            {manageStatus.msg && (
                                <div style={manageStatus.type === "ok" ? styles.ok : styles.err}>{manageStatus.msg}</div>
                            )}

                            {manageResult && (
                                <div style={styles.payloadBox}>
                                    <div style={styles.payloadTitle}>📦 Raw JSON response from backend</div>
                                    <pre style={styles.payload}>{JSON.stringify(manageResult, null, 2)}</pre>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <label style={styles.label}>{label}</label>
            {children}
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#fff" },
    topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", borderBottom: "1px solid rgba(255,255,255,0.07)" },
    back: { background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14 },
    brand: { display: "flex", alignItems: "center", gap: 8 },
    brandIcon: { fontSize: 20, color: "#7fffb2" },
    brandName: { fontSize: 15, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" },
    tabs: { display: "flex", gap: 8, padding: "24px 40px 0" },
    tab: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px 10px 0 0", padding: "10px 24px", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
    tabActive: { background: "rgba(127,255,178,0.08)", border: "1px solid rgba(127,255,178,0.2)", color: "#7fffb2" },
    content: { padding: "0 40px 40px" },
    card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0 12px 12px 12px", padding: "32px" },
    cardTitle: { fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 },
    cardSub: { color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, marginBottom: 28 },
    code: { background: "rgba(127,255,178,0.1)", color: "#7fffb2", padding: "1px 6px", borderRadius: 4, fontSize: 12 },
    form: { display: "flex", flexDirection: "column" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" },
    label: { display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
    input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" },
    ok: { background: "rgba(127,255,178,0.1)", border: "1px solid #7fffb2", borderRadius: 8, padding: "12px", color: "#7fffb2", fontSize: 13, margin: "16px 0" },
    err: { background: "rgba(255,80,80,0.1)", border: "1px solid #ff5050", borderRadius: 8, padding: "12px", color: "#ff5050", fontSize: 13, margin: "16px 0" },
    btn: { background: "linear-gradient(135deg, #7fffb2, #00e676)", color: "#0a0a0f", fontWeight: 800, fontSize: 14, border: "none", borderRadius: 10, padding: "13px", cursor: "pointer", marginTop: 8 },
    actionRow: { display: "flex", gap: 12, marginTop: 4, marginBottom: 16, flexWrap: "wrap" },
    secondaryBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(127,255,178,0.25)", color: "#7fffb2", borderRadius: 10, padding: "12px 20px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" },
    payloadBox: { marginTop: 24, background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px" },
    payloadTitle: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
    payload: { fontSize: 12, color: "#7fffb2", fontFamily: "monospace", lineHeight: 1.6, margin: 0, overflowX: "auto" },
};
