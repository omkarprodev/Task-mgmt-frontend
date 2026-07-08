// =====================================================
// IssuesPage.jsx
// Maps to: IssueController.java (/api/issues/**)
//
// Tabs:
//   "create"  → POST /create_issue
//   "browse"  → POST /search  (also used for "my issues" via assignee filter)
//   "detail"  → GET /{id}, PUT /{id}/status, POST /{id}/addComments
// =====================================================

import { useState } from "react";
import {
    createIssue,
    searchIssues,
    getIssueById,
    updateIssueStatus,
    addComment,
} from "../api/issueApi";

const ISSUE_TYPES = ["STORY", "EPIC", "TASK", "BUG"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["TODO", "OPEN", "IN_PROGRESS", "IN_REVIEW", "DONE", "REOPENED", "CLOSED", "BLOCKED"];

const emptyIssue = {
    issueTitle: "",
    issueDescription: "",
    issueType: "TASK",
    issuePriority: "MEDIUM",
    assigneeEmail: "",
    reporterEmail: localStorage.getItem("user_email") || "",
};

export default function IssuesPage({ onNavigate }) {
    const [activeTab, setActiveTab] = useState("create");

    // Create tab state
    const [form, setForm] = useState(emptyIssue);
    const [labelsInput, setLabelsInput] = useState("");
    const [createStatus, setCreateStatus] = useState({ type: "", msg: "" });
    const [creating, setCreating] = useState(false);

    // Browse tab state
    const [filterStatus, setFilterStatus] = useState("");
    const [filterAssignee, setFilterAssignee] = useState("");
    const [results, setResults] = useState([]);
    const [browsing, setBrowsing] = useState(false);
    const [browseStatus, setBrowseStatus] = useState({ type: "", msg: "" });

    // Detail tab state
    const [lookupId, setLookupId] = useState("");
    const [issue, setIssue] = useState(null);
    const [detailStatus, setDetailStatus] = useState({ type: "", msg: "" });
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [newStatusValue, setNewStatusValue] = useState("");
    const [commentAuthor, setCommentAuthor] = useState(localStorage.getItem("user_email") || "");
    const [commentBody, setCommentBody] = useState("");
    const [commentStatus, setCommentStatus] = useState({ type: "", msg: "" });

    function handleFormChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleCreate(e) {
        e.preventDefault();
        setCreating(true);
        setCreateStatus({ type: "", msg: "" });
        try {
            const labels = labelsInput
                .split(",")
                .map(l => l.trim())
                .filter(Boolean);
            const saved = await createIssue(form, labels);
            setCreateStatus({ type: "ok", msg: `Issue created${saved?.issueKey ? ` (${saved.issueKey})` : ""}!` });
            setForm(emptyIssue);
            setLabelsInput("");
        } catch (err) {
            setCreateStatus({ type: "err", msg: err.message });
        } finally {
            setCreating(false);
        }
    }

    async function handleBrowse(e) {
        e.preventDefault();
        setBrowsing(true);
        setBrowseStatus({ type: "", msg: "" });
        try {
            const filters = {};
            if (filterStatus) filters.issueStatus = filterStatus;
            if (filterAssignee) filters.assignee = filterAssignee;
            const data = await searchIssues(filters);
            setResults(data || []);
            if (!data || data.length === 0) {
                setBrowseStatus({ type: "err", msg: "No issues matched." });
            }
        } catch (err) {
            setBrowseStatus({ type: "err", msg: err.message });
        } finally {
            setBrowsing(false);
        }
    }

    async function handleLookup(e) {
        e.preventDefault();
        setLoadingDetail(true);
        setDetailStatus({ type: "", msg: "" });
        setIssue(null);
        try {
            const data = await getIssueById(lookupId);
            setIssue(data);
            setNewStatusValue(data.issueStatus || "");
        } catch (err) {
            setDetailStatus({ type: "err", msg: "Issue not found" });
        } finally {
            setLoadingDetail(false);
        }
    }

    async function handleStatusUpdate() {
        if (!issue || !newStatusValue) return;
        setDetailStatus({ type: "", msg: "" });
        try {
            const updated = await updateIssueStatus(issue.id, newStatusValue);
            setIssue(updated);
            setDetailStatus({ type: "ok", msg: "Status updated." });
        } catch (err) {
            setDetailStatus({ type: "err", msg: err.message });
        }
    }

    async function handleAddComment(e) {
        e.preventDefault();
        if (!issue) return;
        setCommentStatus({ type: "", msg: "" });
        try {
            await addComment(issue.id, commentAuthor, commentBody);
            setCommentStatus({ type: "ok", msg: "Comment added." });
            setCommentBody("");
        } catch (err) {
            setCommentStatus({ type: "err", msg: err.message });
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.topBar}>
                <button style={styles.back} onClick={() => onNavigate("/dashboard")}>← Dashboard</button>
                <div style={styles.brand}>
                    <span style={styles.brandIcon}>⬡</span>
                    <span style={styles.brandName}>TaskForge · Issues</span>
                </div>
                <div style={{ width: 90 }} />
            </div>

            <div style={styles.tabs}>
                {[
                    { id: "create", label: "Create Issue" },
                    { id: "browse", label: "Search / Browse" },
                    { id: "detail", label: "Issue Detail" },
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
                            <h2 style={styles.cardTitle}>Create Issue</h2>
                            <p style={styles.cardSub}>
                                Calls <code style={styles.code}>POST /api/issues/create_issue</code>
                            </p>
                            <form onSubmit={handleCreate} style={styles.form}>
                                <div style={styles.grid}>
                                    <Field label="Title">
                                        <input
                                            name="issueTitle" required value={form.issueTitle}
                                            onChange={handleFormChange} placeholder="Fix login bug"
                                            style={styles.input}
                                        />
                                    </Field>
                                    <Field label="Type">
                                        <select name="issueType" value={form.issueType} onChange={handleFormChange} style={styles.input}>
                                            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Priority">
                                        <select name="issuePriority" value={form.issuePriority} onChange={handleFormChange} style={styles.input}>
                                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Assignee Email">
                                        <input
                                            name="assigneeEmail" value={form.assigneeEmail}
                                            onChange={handleFormChange} placeholder="dev@company.com"
                                            style={styles.input}
                                        />
                                    </Field>
                                    <Field label="Reporter Email">
                                        <input
                                            name="reporterEmail" value={form.reporterEmail}
                                            onChange={handleFormChange} placeholder="you@company.com"
                                            style={styles.input}
                                        />
                                    </Field>
                                    <Field label="Labels (comma separated)">
                                        <input
                                            value={labelsInput}
                                            onChange={e => setLabelsInput(e.target.value)}
                                            placeholder="backend, urgent"
                                            style={styles.input}
                                        />
                                    </Field>
                                </div>
                                <Field label="Description">
                                    <textarea
                                        name="issueDescription" required value={form.issueDescription}
                                        onChange={handleFormChange} rows={5}
                                        placeholder="Describe the issue…"
                                        style={{ ...styles.input, resize: "vertical" }}
                                    />
                                </Field>

                                {createStatus.msg && (
                                    <div style={createStatus.type === "ok" ? styles.ok : styles.err}>{createStatus.msg}</div>
                                )}

                                <button type="submit" disabled={creating} style={styles.btn}>
                                    {creating ? "Creating…" : "Create Issue"}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── Browse Tab ──────────────────────────── */}
                    {activeTab === "browse" && (
                        <>
                            <h2 style={styles.cardTitle}>Search Issues</h2>
                            <p style={styles.cardSub}>
                                Calls <code style={styles.code}>POST /api/issues/search</code>
                            </p>
                            <form onSubmit={handleBrowse} style={styles.searchForm}>
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...styles.input, flex: 1 }}>
                                    <option value="">Any status</option>
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <input
                                    value={filterAssignee}
                                    onChange={e => setFilterAssignee(e.target.value)}
                                    placeholder="Filter by assignee email (optional)"
                                    style={{ ...styles.input, flex: 2 }}
                                />
                                <button type="submit" disabled={browsing} style={styles.searchBtn}>
                                    {browsing ? "Searching…" : "Search →"}
                                </button>
                            </form>

                            {browseStatus.msg && <div style={styles.err}>{browseStatus.msg}</div>}

                            <div style={styles.issueGrid}>
                                {results.map(iss => (
                                    <IssueCard key={iss.id} issue={iss} onOpen={() => { setLookupId(String(iss.id)); setActiveTab("detail"); setIssue(iss); setNewStatusValue(iss.issueStatus || ""); }} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── Detail Tab ──────────────────────────── */}
                    {activeTab === "detail" && (
                        <>
                            <h2 style={styles.cardTitle}>Issue Detail</h2>
                            <p style={styles.cardSub}>
                                Calls <code style={styles.code}>GET /api/issues/{"{id}"}</code>
                            </p>
                            <form onSubmit={handleLookup} style={styles.searchForm}>
                                <input
                                    value={lookupId}
                                    onChange={e => setLookupId(e.target.value)}
                                    placeholder="Enter issue id"
                                    required
                                    style={{ ...styles.input, flex: 1 }}
                                />
                                <button type="submit" disabled={loadingDetail} style={styles.searchBtn}>
                                    {loadingDetail ? "Loading…" : "Load →"}
                                </button>
                            </form>

                            {detailStatus.msg && (
                                <div style={detailStatus.type === "ok" ? styles.ok : styles.err}>{detailStatus.msg}</div>
                            )}

                            {issue && (
                                <div style={styles.resultCard}>
                                    <div style={styles.resultHeader}>{issue.issueKey || `Issue #${issue.id}`} — {issue.issueTitle}</div>
                                    <div style={styles.resultGrid}>
                                        <ResultRow label="Type" value={issue.issueType} />
                                        <ResultRow label="Priority" value={issue.issuePriority} />
                                        <ResultRow label="Status" value={issue.issueStatus} />
                                        <ResultRow label="Assignee" value={issue.assigneeEmail} />
                                        <ResultRow label="Reporter" value={issue.reporterEmail} />
                                        <ResultRow label="Due Date" value={issue.dueDate} />
                                    </div>
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={styles.resultLabel}>Description</div>
                                        <div style={{ ...styles.resultValue, fontWeight: 400, marginTop: 6, lineHeight: 1.6 }}>{issue.issueDescription}</div>
                                    </div>

                                    {/* Status update */}
                                    <div style={styles.statusRow}>
                                        <select value={newStatusValue} onChange={e => setNewStatusValue(e.target.value)} style={{ ...styles.input, flex: 1 }}>
                                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button type="button" onClick={handleStatusUpdate} style={styles.searchBtn}>Update Status</button>
                                    </div>

                                    {/* Comments */}
                                    <div style={styles.section}>
                                        <div style={styles.sectionTitle}>Add Comment</div>
                                        <form onSubmit={handleAddComment} style={styles.commentForm}>
                                            <input
                                                value={commentAuthor}
                                                onChange={e => setCommentAuthor(e.target.value)}
                                                placeholder="Your email"
                                                required
                                                style={{ ...styles.input, marginBottom: 10 }}
                                            />
                                            <textarea
                                                value={commentBody}
                                                onChange={e => setCommentBody(e.target.value)}
                                                placeholder="Write a comment…"
                                                required
                                                rows={3}
                                                style={{ ...styles.input, resize: "vertical", marginBottom: 10 }}
                                            />
                                            {commentStatus.msg && (
                                                <div style={commentStatus.type === "ok" ? styles.ok : styles.err}>{commentStatus.msg}</div>
                                            )}
                                            <button type="submit" style={styles.btn}>Post Comment</button>
                                        </form>
                                    </div>

                                    <div style={styles.payloadBox}>
                                        <div style={styles.payloadTitle}>📦 Raw JSON response from backend</div>
                                        <pre style={styles.payload}>{JSON.stringify(issue, null, 2)}</pre>
                                    </div>
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

function ResultRow({ label, value }) {
    return (
        <div style={styles.resultRow}>
            <span style={styles.resultLabel}>{label}</span>
            <span style={styles.resultValue}>{value || "—"}</span>
        </div>
    );
}

function IssueCard({ issue, onOpen }) {
    return (
        <div style={styles.issueCard} onClick={onOpen}>
            <div style={styles.issueCardTop}>
                <span style={styles.issueKey}>{issue.issueKey || `#${issue.id}`}</span>
                <span style={{ ...styles.priorityChip, ...priorityStyle(issue.issuePriority) }}>{issue.issuePriority}</span>
            </div>
            <div style={styles.issueTitle}>{issue.issueTitle}</div>
            <div style={styles.issueMeta}>{issue.issueType} · {issue.assigneeEmail || "unassigned"}</div>
            <div style={{ ...styles.statusChip, ...statusStyle(issue.issueStatus) }}>{issue.issueStatus}</div>
        </div>
    );
}

function priorityStyle(p) {
    const map = {
        LOW: { color: "#60afff", background: "rgba(96,175,255,0.12)" },
        MEDIUM: { color: "#ffb347", background: "rgba(255,179,71,0.12)" },
        HIGH: { color: "#ff8080", background: "rgba(255,128,128,0.12)" },
        CRITICAL: { color: "#ff5050", background: "rgba(255,80,80,0.15)" },
    };
    return map[p] || { color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)" };
}

function statusStyle(s) {
    const map = {
        DONE: { color: "#7fffb2", background: "rgba(127,255,178,0.12)" },
        CLOSED: { color: "#7fffb2", background: "rgba(127,255,178,0.12)" },
        IN_PROGRESS: { color: "#60afff", background: "rgba(96,175,255,0.12)" },
        BLOCKED: { color: "#ff5050", background: "rgba(255,80,80,0.15)" },
    };
    return map[s] || { color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)" };
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
    searchForm: { display: "flex", gap: 12, marginBottom: 20 },
    searchBtn: { background: "linear-gradient(135deg, #7fffb2, #00e676)", color: "#0a0a0f", fontWeight: 800, fontSize: 14, border: "none", borderRadius: 10, padding: "12px 24px", cursor: "pointer", whiteSpace: "nowrap" },
    issueGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 },
    issueCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px", cursor: "pointer" },
    issueCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    issueKey: { fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" },
    priorityChip: { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8 },
    issueTitle: { fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 },
    issueMeta: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 },
    statusChip: { display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10 },
    resultCard: { background: "rgba(127,255,178,0.03)", border: "1px solid rgba(127,255,178,0.15)", borderRadius: 14, padding: "24px" },
    resultHeader: { fontSize: 16, fontWeight: 700, color: "#7fffb2", marginBottom: 20 },
    resultGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },
    resultRow: { display: "flex", flexDirection: "column", gap: 4 },
    resultLabel: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 },
    resultValue: { fontSize: 14, color: "#fff", fontWeight: 600 },
    statusRow: { display: "flex", gap: 12, marginBottom: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" },
    section: { marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" },
    sectionTitle: { fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 },
    commentForm: { display: "flex", flexDirection: "column" },
    payloadBox: { marginTop: 24, background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px" },
    payloadTitle: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
    payload: { fontSize: 12, color: "#7fffb2", fontFamily: "monospace", lineHeight: 1.6, margin: 0, overflowX: "auto" },
};
