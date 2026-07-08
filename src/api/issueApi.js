// =====================================================
// issueApi.js
// PURPOSE: All API calls for the Issue feature
// BASE URL: http://localhost:7676/api/issues
// Maps to: IssueController.java / IssueService.java
// =====================================================

const BASE_URL = "http://localhost:7676/api/issues";

function getToken() {
    return localStorage.getItem("jwt_token");
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

// ─── POST /create_issue?labels=a,b,c ───────────────
// PURPOSE: Create a new issue
// @RequestBody Issue issue, @RequestParam(required=false) Set<String> labels
export async function createIssue(issue, labels = []) {
    const query = labels.length
        ? `?${labels.map(l => `labels=${encodeURIComponent(l)}`).join("&")}`
        : "";
    const res = await fetch(`${BASE_URL}/create_issue${query}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(issue),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── POST /{id}/addComments?authorEmail= ───────────
// PURPOSE: Add a comment to an issue
// @RequestBody String body → sent as a JSON string
export async function addComment(issueId, authorEmail, body) {
    const res = await fetch(
        `${BASE_URL}/${issueId}/addComments?authorEmail=${encodeURIComponent(authorEmail)}`,
        {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(body),
        }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── GET /{id} ──────────────────────────────────────
// PURPOSE: Get a single issue by its id
export async function getIssueById(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── GET /assignee?email= ──────────────────────────
// PURPOSE: List all issues assigned to a given email
export async function getIssuesByAssignee(email) {
    const res = await fetch(`${BASE_URL}/assignee?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── PUT /{id}/status?issueStatus= ─────────────────
// PURPOSE: Update the status of an issue
export async function updateIssueStatus(id, issueStatus) {
    const res = await fetch(`${BASE_URL}/${id}/status?issueStatus=${encodeURIComponent(issueStatus)}`, {
        method: "PUT",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── POST /search ───────────────────────────────────
// PURPOSE: Search/filter issues
// @RequestBody Map<String,String> filters, e.g. { issueStatus: "OPEN" } or { assignee: "a@b.com" }
export async function searchIssues(filters) {
    const res = await fetch(`${BASE_URL}/search`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(filters),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
