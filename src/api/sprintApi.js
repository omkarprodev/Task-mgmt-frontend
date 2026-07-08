// =====================================================
// sprintApi.js
// PURPOSE: All API calls for the Sprint feature
// BASE URL: http://localhost:7676
// Maps to: SprintController.java / SprintService.java
//
// NOTE: SprintController is declared with
//   @RequestMapping   (no path value)
// so, as currently written, its endpoints sit at the
// ROOT of the app (e.g. "/create_sprint"), NOT under
// "/api/sprints". These calls match that as-written
// behavior. Flag this with Omkar — it's almost
// certainly meant to be @RequestMapping("/api/sprints").
// =====================================================

const BASE_URL = "http://localhost:7676";

function getToken() {
    return localStorage.getItem("jwt_token");
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

// ─── POST /create_sprint ───────────────────────────
// @RequestBody Sprint sprint
export async function createSprint(sprint) {
    const res = await fetch(`${BASE_URL}/create_sprint`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(sprint),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── PUT /assign/{sprintId}/{issueId} ──────────────
// Assigns an issue to a sprint
export async function assignSprintToIssue(sprintId, issueId) {
    const res = await fetch(`${BASE_URL}/assign/${sprintId}/${issueId}`, {
        method: "PUT",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── PUT /{sprintId}/start ─────────────────────────
export async function startSprint(sprintId) {
    const res = await fetch(`${BASE_URL}/${sprintId}/start`, {
        method: "PUT",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── PUT /{sprintId}/close ─────────────────────────
export async function closeSprint(sprintId) {
    const res = await fetch(`${BASE_URL}/${sprintId}/close`, {
        method: "PUT",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
