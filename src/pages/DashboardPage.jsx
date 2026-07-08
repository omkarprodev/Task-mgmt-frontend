// =====================================================
// DashboardPage.jsx
// Requires: Valid JWT in localStorage ("jwt_token")
// Maps logout to: POST /api/auth/loggedOut
//   → sends Authorization: Bearer <token>
//   → TokenKillingService.blockToken(token) — adds to ConcurrentHashMap
// Shows: role permissions, system overview
// =====================================================

import { useState } from "react";
import { logoutUser } from "../api/authApi";

// Permission map — mirrors RoleBasedPermission.java
const ROLE_PERMISSIONS = {
  ADMIN:     ["ISSUE_VIEW","ISSUE_CREATE","ISSUE_EDIT","ISSUE_DELETE","COMMENT_ADD","COMMENT_DELETE","USER_MANAGE"],
  MANAGER:   ["ISSUE_VIEW","ISSUE_CREATE","ISSUE_EDIT","COMMENT_ADD"],
  DEVELOPER: ["ISSUE_VIEW","ISSUE_EDIT","COMMENT_ADD"],
  TESTER:    ["ISSUE_VIEW","COMMENT_ADD"],
};

const ALL_PERMISSIONS = ["ISSUE_VIEW","ISSUE_CREATE","ISSUE_EDIT","ISSUE_DELETE","COMMENT_ADD","COMMENT_DELETE","USER_MANAGE"];

export default function DashboardPage({ onNavigate }) {
  const role = localStorage.getItem("user_role") || "DEVELOPER";
  const email = localStorage.getItem("user_email") || "user@company.com";
  const [logoutStatus, setLogoutStatus] = useState({ type: "", msg: "" });
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const permissions = ROLE_PERMISSIONS[role] || [];

  async function handleLogout() {
    setLoggingOut(true);
    try {
      // Sends token in Authorization header → TokenKillingService blocks it
      const msg = await logoutUser();
      setLogoutStatus({ type: "ok", msg });
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_email");
      setTimeout(() => onNavigate("/login"), 1500);
    } catch (err) {
      setLogoutStatus({ type: "err", msg: err.message });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
      <div style={styles.page}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sideTop}>
            <div style={styles.brand}>
              <span style={styles.brandIcon}>⬡</span>
              <span style={styles.brandName}>TMT</span>
            </div>

            <nav style={styles.nav}>
              {[
                { id: "overview", icon: "🏠", label: "Overview" },
                { id: "permissions", icon: "🛡", label: "Permissions" },
                { id: "issues-nav", icon: "🐞", label: "Issues" },
                { id: "sprints-nav", icon: "🏃", label: "Sprints" },
                { id: "profile-nav", icon: "👤", label: "My Profile" },
              ].map(item => (
                  <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === "profile-nav") {
                          onNavigate("/profile");
                        } else if (item.id === "issues-nav") {
                          onNavigate("/issues");
                        } else if (item.id === "sprints-nav") {
                          onNavigate("/sprints");
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      style={{ ...styles.navBtn, ...(activeTab === item.id ? styles.navBtnActive : {}) }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
              ))}
            </nav>
          </div>

          {/* User info + logout */}
          <div style={styles.sideBottom}>
            <div style={styles.userCard}>
              <div style={styles.avatar}>{email[0]?.toUpperCase()}</div>
              <div>
                <div style={styles.userEmail}>{email}</div>
                <div style={{ ...styles.rolePill, background: roleColor(role) + "22", color: roleColor(role) }}>
                  {roleIcon(role)} {role}
                </div>
              </div>
            </div>

            {logoutStatus.msg && (
                <div style={logoutStatus.type === "ok" ? styles.ok : styles.err}>
                  {logoutStatus.msg}
                </div>
            )}

            <button onClick={handleLogout} disabled={loggingOut} style={styles.logoutBtn}>
              {loggingOut ? "Logging out…" : "🚪 Logout"}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={styles.main}>
          {/* ── Overview Tab ─────────────────────── */}
          {activeTab === "overview" && (
              <div style={styles.content}>
                <h1 style={styles.pageTitle}>Welcome back 👋</h1>
                <p style={styles.pageSub}>You're authenticated as <strong style={{ color: roleColor(role) }}>{role}</strong>. Your JWT token is active.</p>

                <div style={styles.statsGrid}>
                  <StatCard icon="✉" value={email} label="Registered Email" color="#7fffb2" />
                  <StatCard icon="🎭" value={role} label="Your Role" color={roleColor(role)} />
                  <StatCard icon="🛡" value={permissions.length} label="Permissions" color="#60afff" />
                </div>

                {/* Role hierarchy diagram */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Role Hierarchy (from Role.java + RoleBasedPermission.java)</h3>
                  <div style={styles.roleHierarchy}>
                    {Object.entries(ROLE_PERMISSIONS).map(([r, perms]) => (
                        <div key={r} style={{ ...styles.hierCard, borderColor: r === role ? roleColor(r) + "55" : "rgba(255,255,255,0.06)", background: r === role ? roleColor(r) + "0a" : "rgba(255,255,255,0.02)" }}>
                          <div style={styles.hierHeader}>
                            <span style={{ fontSize: 20 }}>{roleIcon(r)}</span>
                            <span style={{ ...styles.hierRole, color: r === role ? roleColor(r) : "rgba(255,255,255,0.6)" }}>
                        {r} {r === role && <span style={{ fontSize: 10, opacity: 0.7 }}>← YOU</span>}
                      </span>
                          </div>
                          <div style={styles.hierPerms}>
                            {ALL_PERMISSIONS.map(p => (
                                <span key={p} style={{ ...styles.permChip, opacity: perms.includes(p) ? 1 : 0.2, background: perms.includes(p) ? roleColor(r) + "18" : "rgba(255,255,255,0.03)", color: perms.includes(p) ? roleColor(r) : "rgba(255,255,255,0.2)" }}>
                          {perms.includes(p) ? "✓" : "✕"} {p.replace("_", " ")}
                        </span>
                            ))}
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
          )}

          {/* ── Permissions Tab ───────────────────── */}
          {activeTab === "permissions" && (
              <div style={styles.content}>
                <h1 style={styles.pageTitle}>Your Permissions</h1>
                <p style={styles.pageSub}>
                  Permissions for <strong style={{ color: roleColor(role) }}>{role}</strong> are defined in{" "}
                  <code style={styles.inlineCode}>RoleBasedPermission.java</code>
                </p>

                <div style={styles.permList}>
                  {ALL_PERMISSIONS.map(p => {
                    const has = permissions.includes(p);
                    return (
                        <div key={p} style={{ ...styles.permRow, opacity: has ? 1 : 0.35 }}>
                          <div style={{ ...styles.permStatus, background: has ? "#7fffb2" : "rgba(255,255,255,0.1)", color: has ? "#0a0a0f" : "rgba(255,255,255,0.3)" }}>
                            {has ? "✓" : "✕"}
                          </div>
                          <div>
                            <div style={styles.permName}>{p}</div>
                            <div style={styles.permDesc}>{permDesc(p)}</div>
                          </div>
                        </div>
                    );
                  })}
                </div>

                {/*<div style={styles.section}>*/}
                {/*  <h3 style={styles.sectionTitle}>From Permission.java (Enum)</h3>*/}
                {/*  <div style={styles.codeBlock}>*/}
                {/*    <CodeLine c="#c084fc">{"public enum Permission {"}</CodeLine>*/}
                {/*    {ALL_PERMISSIONS.map(p => (*/}
                {/*        <CodeLine key={p} c="#7fffb2">&nbsp;&nbsp;{p}{permissions.includes(p) ? " ← YOU HAVE THIS" : ""}</CodeLine>*/}
                {/*    ))}*/}
                {/*    <CodeLine c="#c084fc">{"}"}</CodeLine>*/}
                {/*  </div>*/}
                {/*</div>*/}
              </div>
          )}
        </div>
      </div>
  );
}

// Sub-components
function StatCard({ icon, value, label, color }) {
  return (
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 22px" }}>
        <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color, marginBottom: 4, wordBreak: "break-all" }}>{value}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
      </div>
  );
}

function CodeLine({ c, children }) {
  return <div style={{ color: c, fontSize: 12, fontFamily: "monospace", lineHeight: 1.8 }}>{children}</div>;
}

function roleIcon(r) { return { ADMIN: "👑", MANAGER: "📋", DEVELOPER: "💻", TESTER: "🔬" }[r] || "👤"; }
function roleColor(r) { return { ADMIN: "#ff80ab", MANAGER: "#ffb347", DEVELOPER: "#60afff", TESTER: "#c084fc" }[r] || "#7fffb2"; }
function permDesc(p) {
  return {
    ISSUE_VIEW: "Read/list all issues in the system",
    ISSUE_CREATE: "Create new issues or tasks",
    ISSUE_EDIT: "Update issue details or status",
    ISSUE_DELETE: "Permanently delete issues",
    COMMENT_ADD: "Add comments to issues",
    COMMENT_DELETE: "Delete any comment",
    USER_MANAGE: "Create, update, or remove users",
  }[p] || "";
}

const styles = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#0a0a0f", color: "#fff" },
  sidebar: { width: 240, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 },
  sideTop: { padding: "28px 16px" },
  brand: { display: "flex", alignItems: "center", gap: 8, marginBottom: 36, paddingLeft: 8 },
  brandIcon: { fontSize: 22, color: "#7fffb2" },
  brandName: { fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: 2, textTransform: "uppercase" },
  nav: { display: "flex", flexDirection: "column", gap: 4 },
  navBtn: { display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: "rgba(255,255,255,0.4)", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", textAlign: "left", transition: "all .15s" },
  navBtnActive: { background: "rgba(127,255,178,0.08)", color: "#7fffb2" },
  sideBottom: { padding: "20px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  userCard: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "rgba(127,255,178,0.15)", color: "#7fffb2", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  userEmail: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4, wordBreak: "break-all" },
  rolePill: { display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 },
  ok: { background: "rgba(127,255,178,0.1)", border: "1px solid #7fffb2", borderRadius: 6, padding: "8px 10px", color: "#7fffb2", fontSize: 11, marginBottom: 10 },
  err: { background: "rgba(255,80,80,0.1)", border: "1px solid #ff5050", borderRadius: 6, padding: "8px 10px", color: "#ff5050", fontSize: 11, marginBottom: 10 },
  logoutBtn: { width: "100%", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff8080", borderRadius: 10, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, overflowY: "auto" },
  content: { padding: "40px 48px", maxWidth: 900 },
  pageTitle: { fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 8 },
  pageSub: { color: "rgba(255,255,255,0.45)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 },
  inlineCode: { background: "rgba(127,255,178,0.1)", color: "#7fffb2", padding: "1px 6px", borderRadius: 4, fontSize: 13 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 36 },
  section: { marginTop: 36 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  roleHierarchy: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  hierCard: { border: "1px solid", borderRadius: 14, padding: "16px" },
  hierHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  hierRole: { fontWeight: 800, fontSize: 14 },
  hierPerms: { display: "flex", flexDirection: "column", gap: 4 },
  permChip: { fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 600 },
  codeBlock: { background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 20px" },
  permList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 },
  permRow: { display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px" },
  permStatus: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 },
  permName: { fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 },
  permDesc: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
};
