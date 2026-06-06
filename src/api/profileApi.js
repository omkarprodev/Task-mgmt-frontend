// =====================================================
// profileApi.js
// PURPOSE: All API calls for User Profile feature
// BASE URL: http://localhost:7676/api/user_profies
//
// HOW fetch() WORKS:
// fetch(url, options) → makes HTTP request to backend
// await → waits for backend to respond before moving on
// res.json() → converts backend JSON response to JS object
// =====================================================

const BASE_URL = "http://localhost:7676/api/user_profile";

// Helper function — reads JWT token saved during login/register
// JWT is needed so backend knows WHO is making the request
function getToken() {
    return localStorage.getItem("jwt_token");
}

// Helper function — builds headers with JWT token
// Authorization: Bearer <token> → this is how Spring Security reads it
function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

// ─── PUT /update/{officialEmail} ───────────────────
// PURPOSE: Update user profile
// @RequestBody UserProfileUpdateDTO → we send full profile as JSON
// Fields: userName, userOfficialEmail, personalEmail,
//         department, designation, organizatinName, active
export async function updateProfile(userOfficialEmail, profileData) {
    const res = await fetch(`${BASE_URL}/update/${userOfficialEmail}`, {
        method: "PUT",           // PUT = update existing data
        headers: authHeaders(),  // sends JWT token in header
        body: JSON.stringify(profileData), // converts JS object to JSON string
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // returns updated UserProfileUpdateDTO
}

// ─── GET /profile/all ──────────────────────────────
// PURPOSE: Get list of all user profiles
// Returns: List<UserProfileUpdateDTO>
export async function getAllProfiles() {
    const res = await fetch(`${BASE_URL}/profile/all`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // returns array of profiles []
}

// ─── GET /{officialEmail} ──────────────────────────
// PURPOSE: Get single profile by official email
// @PathVariable → email goes in the URL itself
export async function getProfileByUserOfficialEmail(userOfficialEmail) {
    const res = await fetch(`${BASE_URL}/official/${userOfficialEmail}`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // returns single UserProfileUpdateDTO
}