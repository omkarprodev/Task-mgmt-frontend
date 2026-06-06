// =====================================================
// UserProfilePage.jsx
//
// REACT CONCEPTS USED HERE:
//
// 1. useState(initialValue)
//    → Creates a variable that React WATCHES
//    → When it changes, React automatically updates the UI
//    → Like a live variable
//    → Example: const [name, setName] = useState("")
//               name = current value
//               setName = function to update value
//
// 2. useEffect(() => { }, [])
//    → Runs code when page first loads
//    → The [] means "run only once when page opens"
//    → Used to fetch data from backend on page load
//
// 3. async/await
//    → Used to wait for backend response
//    → Without await, React won't wait and moves on
// =====================================================

import { useState, useEffect } from "react";
import { updateProfile, getAllProfiles, getProfileByUserOfficialEmail } from "../api/profileApi";

export default function UserProfilePage({ onNavigate }) {

    // ── useState examples ──────────────────────────────
    // activeTab → which tab is currently visible
    const [activeTab, setActiveTab] = useState("myProfile");

    // form → stores all input field values as one object
    // This mirrors your UserProfileUpdateDTO fields exactly
    const [form, setForm] = useState({
        userName: "",
        userOfficialEmail: localStorage.getItem("user_email") || "",
        personalEmail: "",
        department: "",
        designation: "",
        organizatinName: "", // note: matches DTO spelling exactly
        active: true,
    });

    // profiles → stores the list from GET /profile/all
    const [profiles, setProfiles] = useState([]); // [] = empty array initially

    // searchEmail → what user types in search box
    const [searchEmail, setSearchEmail] = useState("");

    // searchResult → single profile returned by search
    const [searchResult, setSearchResult] = useState(null);

    // status → shows success or error messages
    const [status, setStatus] = useState({ type: "", msg: "" });

    // loading → true while waiting for backend response
    const [loading, setLoading] = useState(false);

    // ── useEffect ──────────────────────────────────────
    // Runs ONCE when this page first opens
    // Fetches existing profile data to pre-fill the form
    useEffect(() => {
        // Define async function inside useEffect
        // (useEffect itself cannot be async directly)
        async function loadMyProfile() {
            try {
                const email = localStorage.getItem("user_email");
                if (email) {
                    // Call our profileApi function
                    const data = await getProfileByUserOfficialEmail(email);
                    // setForm updates the form state with fetched data
                    // ...data = spread operator, copies all fields from data into form
                    setForm(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                // Profile may not exist yet — that's fine, ignore error
                console.log("No existing profile found");
            }
        }
        loadMyProfile(); // call the function
    }, []); // [] = run only once on page load

    // ── handleChange ──────────────────────────────────
    // Called every time user types in any input field
    // e = event object (contains which field changed and new value)
    function handleChange(e) {
        const { name, value } = e.target;
        // ...form = keep all existing form values
        // [name]: value = update only the field that changed
        setForm({ ...form, [name]: value });
    }

    // ── handleUpdate ──────────────────────────────────
    // Called when user clicks "Update Profile" button
    // Maps to: PUT /update/{officialEmail}
    async function handleUpdate(e) {
        e.preventDefault(); // stops page from refreshing on form submit
        setLoading(true);
        setStatus({ type: "", msg: "" });
        try {
            // Call API → sends form data to Spring Boot
            const updated = await updateProfile(form.userOfficialEmail, form);
            setStatus({ type: "ok", msg: "Profile updated successfully!" });
            // Update form with response from backend
            setForm(prev => ({ ...prev, ...updated }));
        } catch (err) {
            setStatus({ type: "err", msg: err.message });
        } finally {
            // finally = runs whether success or error
            setLoading(false);
        }
    }

    // ── loadAllProfiles ────────────────────────────────
    // Called when user clicks "All Profiles" tab
    // Maps to: GET /profile/all
    async function loadAllProfiles() {
        setLoading(true);
        try {
            const data = await getAllProfiles();
            setProfiles(data); // store array in state
        } catch (err) {
            setStatus({ type: "err", msg: err.message });
        } finally {
            setLoading(false);
        }
    }

    // ── handleSearch ──────────────────────────────────
    // Maps to: GET /{officialEmail}
    async function handleSearch(e) {
        e.preventDefault();
        setLoading(true);
        setSearchResult(null);
        try {
            const data = await getProfileByUserOfficialEmail(searchEmail);
            setSearchResult(data); // store single profile
        } catch (err) {
            setStatus({ type: "err", msg: "Profile not found" });
        } finally {
            setLoading(false);
        }
    }

    // ── RETURN = what gets displayed on screen ─────────
    return (
        <div style={styles.page}>

            {/* ── Top Navigation Bar ── */}
            <div style={styles.topBar}>
                <button onClick={() => onNavigate("/dashboard")} style={styles.back}>
                    ← Dashboard
                </button>
                <div style={styles.brand}>
                    <span style={styles.brandIcon}>⬡</span>
                    <span style={styles.brandName}>TMT — User Profile</span>
                </div>
                <div />
            </div>

            {/* ── Tab Buttons ── */}
            {/* Tabs = clicking them changes activeTab state */}
            <div style={styles.tabs}>
                {[
                    { id: "myProfile", label: "👤 My Profile" },
                    { id: "allProfiles", label: "👥 All Profiles" },
                    { id: "search", label: "🔍 Search Profile" },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            // Load all profiles when that tab is clicked
                            if (tab.id === "allProfiles") loadAllProfiles();
                        }}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab.id ? styles.tabActive : {}),
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={styles.content}>

                {/* ════════════════════════════════════════
            TAB 1 — MY PROFILE
            Maps to: PUT /update/{officialEmail}
            Shows form to update logged-in user's profile
        ════════════════════════════════════════ */}
                {activeTab === "myProfile" && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Update My Profile</h2>
                        {/* Form — each input is a "controlled input"
                value={form.fieldName} → React controls the value
                onChange={handleChange} → updates state on every keystroke */}
                        <form onSubmit={handleUpdate} style={styles.form}>

                            <div style={styles.grid}>
                                <Field label="Full Name" note="userName">
                                    <input
                                        name="userName"
                                        value={form.userName}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        style={styles.input}
                                    />
                                </Field>

                                <Field label="Official Email" note="userOfficialEmail">
                                    <input
                                        name="userOfficialEmail"
                                        value={form.userOfficialEmail}
                                        onChange={handleChange}
                                        placeholder="official@company.com"
                                        style={{ ...styles.input, opacity: 0.7 }}
                                    />
                                </Field>

                                <Field label="Personal Email" note="personalEmail">
                                    <input
                                        name="personalEmail"
                                        value={form.personalEmail}
                                        onChange={handleChange}
                                        placeholder="personal@gmail.com"
                                        style={styles.input}
                                    />
                                </Field>

                                <Field label="Department" note="department">
                                    <input
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        placeholder="e.g. Engineering"
                                        style={styles.input}
                                    />
                                </Field>

                                <Field label="Designation" note="designation">
                                    <input
                                        name="designation"
                                        value={form.designation}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Developer"
                                        style={styles.input}
                                    />
                                </Field>

                                {/* Note: organizatinName is the DTO field name (typo in original) */}
                                <Field label="Organization Name" note="organizatinName">
                                    <input
                                        name="organizatinName"
                                        value={form.organizatinName}
                                        onChange={handleChange}
                                        placeholder="e.g. Infosys"
                                        style={styles.input}
                                    />
                                </Field>
                            </div>

                            {/* Status message — shows success or error */}
                            {status.msg && (
                                <div style={status.type === "ok" ? styles.ok : styles.err}>
                                    {status.msg}
                                </div>
                            )}

                            <button type="submit" disabled={loading} style={styles.btn}>
                                {loading ? "Updating…" : "Update Profile →"}
                            </button>
                        </form>

                        {/* What gets sent to backend — learning helper */}
              {/*          <div style={styles.payloadBox}>*/}
              {/*              <div style={styles.payloadTitle}>*/}
              {/*                  📦 JSON being sent to backend (Request Body)*/}
              {/*              </div>*/}
              {/*              <pre style={styles.payload}>*/}
              {/*  {JSON.stringify(form, null, 2)}*/}
              {/*</pre>*/}
              {/*          </div>*/}
                    </div>
                )}

                {/* ════════════════════════════════════════
            TAB 2 — ALL PROFILES
            Maps to: GET /profile/all
            Shows table of all UserProfileUpdateDTO objects
        ════════════════════════════════════════ */}
                {activeTab === "allProfiles" && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>All Profiles</h2>
                        <button onClick={loadAllProfiles} style={styles.refreshBtn}>
                            🔄 Refresh
                        </button>

                        {loading && <div style={styles.loading}>Loading profiles…</div>}

                        {/* profiles.length = number of items in array */}
                        {profiles.length === 0 && !loading && (
                            <div style={styles.empty}>No profiles found in database</div>
                        )}

                        {/* .map() = loop through array, create one card per profile */}
                        {/* This is how React displays lists — always use .map() */}
                        <div style={styles.profileGrid}>
                            {profiles.map((profile, index) => (
                                // key={index} → React needs unique key for each item in list
                                <div key={index} style={styles.profileCard}>
                                    <div style={styles.profileAvatar}>
                                        {profile.userName?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div style={styles.profileInfo}>
                                        <div style={styles.profileName}>{profile.userName}</div>
                                        <div style={styles.profileEmail}>{profile.userOfficialEmail}</div>
                                        <div style={styles.profileMeta}>
                                            {profile.designation} • {profile.department}
                                        </div>
                                        <div style={styles.profileOrg}>{profile.organizatinName}</div>
                                        <span style={{
                                            ...styles.activeBadge,
                                            background: profile.active ? "rgba(127,255,178,0.15)" : "rgba(255,80,80,0.15)",
                                            color: profile.active ? "#7fffb2" : "#ff5050",
                                        }}>
                      {profile.active ? "● Active" : "● Inactive"}
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════
            TAB 3 — SEARCH PROFILE
            Maps to: GET /{officialEmail}
            Searches profile by email
        ════════════════════════════════════════ */}
                {activeTab === "search" && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Search Profile</h2>
                        {/*<p style={styles.cardSub}>*/}
                        {/*    Calls <code style={styles.code}>GET /api/user_profies/{"{userOfficialEmail}"}</code>*/}
                        {/*    <br />*/}
                        {/*    Email goes as <code style={styles.code}>@PathVariable</code> in the URL*/}
                        {/*</p>*/}

                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            <input
                                type="email"
                                value={searchEmail}
                                onChange={e => setSearchEmail(e.target.value)}
                                placeholder="Enter official email to search"
                                required
                                style={{ ...styles.input, flex: 1 }}
                            />
                            <button type="submit" disabled={loading} style={styles.searchBtn}>
                                {loading ? "Searching…" : "Search →"}
                            </button>
                        </form>

                        {/* Show URL being called — helps understand PathVariable */}
                        {searchEmail && (
                            <div style={styles.urlPreview}>
                                <span style={styles.methodGet}>GET</span>
                                <code style={styles.urlText}>
                                    /api/user_profies/<span style={{ color: "#7fffb2" }}>{searchEmail}</span>
                                </code>
                            </div>
                        )}

                        {status.msg && activeTab === "search" && (
                            <div style={styles.err}>{status.msg}</div>
                        )}

                        {/* searchResult = the profile returned by backend */}
                        {/* Only shows when searchResult is not null */}
                        {searchResult && (
                            <div style={styles.resultCard}>
                                <div style={styles.resultHeader}>Profile Found ✓</div>
                                <div style={styles.resultGrid}>
                                    <ResultRow label="Full Name" value={searchResult.userName} />
                                    <ResultRow label="Official Email" value={searchResult.userOfficialEmail} />
                                    <ResultRow label="Personal Email" value={searchResult.personalEmail} />
                                    <ResultRow label="Department" value={searchResult.department} />
                                    <ResultRow label="Designation" value={searchResult.designation} />
                                    <ResultRow label="Organization" value={searchResult.organizatinName} />
                                    <ResultRow
                                        label="Status"
                                        value={searchResult.active ? "Active" : "Inactive"}
                                    />
                                </div>

                                {/* Raw JSON response — shows exactly what backend returned */}
                                <div style={styles.payloadBox}>
                                    <div style={styles.payloadTitle}>
                                        📦 Raw JSON response from backend
                                    </div>
                                    <pre style={styles.payload}>
                    {JSON.stringify(searchResult, null, 2)}
                  </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Small reusable components ──────────────────────
// These are React components — small reusable pieces of UI
// Props = data passed into the component like HTML attributes

function Field({ label, note, children }) {
    return (
        <div style={{ marginBottom: 20 }}>
            {/*<label style={styles.label}>*/}
            {/*    {label}*/}
            {/*    <span style={styles.fieldNote}> → DTO: {note}</span>*/}
            {/*</label>*/}
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

// ── Styles ─────────────────────────────────────────
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
    fieldNote: { color: "rgba(127,255,178,0.4)", textTransform: "none", letterSpacing: 0, fontWeight: 400 },
    input: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" },
    ok: { background: "rgba(127,255,178,0.1)", border: "1px solid #7fffb2", borderRadius: 8, padding: "12px", color: "#7fffb2", fontSize: 13, margin: "16px 0" },
    err: { background: "rgba(255,80,80,0.1)", border: "1px solid #ff5050", borderRadius: 8, padding: "12px", color: "#ff5050", fontSize: 13, margin: "16px 0" },
    btn: { background: "linear-gradient(135deg, #7fffb2, #00e676)", color: "#0a0a0f", fontWeight: 800, fontSize: 14, border: "none", borderRadius: 10, padding: "13px", cursor: "pointer", marginTop: 8 },
    payloadBox: { marginTop: 28, background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px" },
    payloadTitle: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
    payload: { fontSize: 12, color: "#7fffb2", fontFamily: "monospace", lineHeight: 1.6, margin: 0, overflowX: "auto" },
    refreshBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" },
    loading: { color: "rgba(255,255,255,0.4)", fontSize: 14, padding: "20px 0" },
    empty: { color: "rgba(255,255,255,0.3)", fontSize: 14, padding: "40px 0", textAlign: "center" },
    profileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
    profileCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px", display: "flex", gap: 14, alignItems: "flex-start" },
    profileAvatar: { width: 44, height: 44, borderRadius: "50%", background: "rgba(127,255,178,0.12)", color: "#7fffb2", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 },
    profileEmail: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 },
    profileMeta: { fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 3 },
    profileOrg: { fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8 },
    activeBadge: { fontSize: 11, padding: "2px 10px", borderRadius: 10, fontWeight: 700 },
    searchForm: { display: "flex", gap: 12, marginBottom: 16 },
    searchBtn: { background: "linear-gradient(135deg, #7fffb2, #00e676)", color: "#0a0a0f", fontWeight: 800, fontSize: 14, border: "none", borderRadius: 10, padding: "12px 24px", cursor: "pointer", whiteSpace: "nowrap" },
    urlPreview: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 14px" },
    methodGet: { background: "#60afff", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4 },
    urlText: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
    resultCard: { background: "rgba(127,255,178,0.03)", border: "1px solid rgba(127,255,178,0.15)", borderRadius: 14, padding: "24px" },
    resultHeader: { fontSize: 14, fontWeight: 700, color: "#7fffb2", marginBottom: 20 },
    resultGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },
    resultRow: { display: "flex", flexDirection: "column", gap: 4 },
    resultLabel: { fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 },
    resultValue: { fontSize: 14, color: "#fff", fontWeight: 600 },
};