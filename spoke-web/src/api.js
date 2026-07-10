// All communication with the Spring Boot backend lives in this one file.
// Components import these functions and never build URLs themselves.

const API_DOMAIN = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE_URL = `${API_DOMAIN}/api`;

// Small helper: run a fetch, throw a readable error if the server says no,
// otherwise return the parsed JSON.
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    // Spring puts a human-readable "message" in the error JSON — use it if present
    const body = await response.json().catch(() => null);
    const error = new Error(body?.message || `Request failed: ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  // 204 No Content (e.g. after a delete) has no body to parse
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

// POST /api/users/register — creates an account, returns { id, name, email }
export function register(name, email, password) {
  return request('/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// POST /api/users/login — returns { id, name, email } or fails with 401
export function login(email, password) {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// GET /api/users/{id} — confirms a remembered login still points at a real
// account (404 when it does not). Called once when the app starts.
export function getUser(userId) {
  return request(`/users/${userId}`);
}

// PUT /api/users/{id} — saves the rider's profile extras: riding style
// (blank clears it) and, when a new one was picked, the bike photo as a
// downscaled data URL. Returns the updated user.
export function updateProfile(userId, profileData) {
  return request(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

// Where a rider's bike photo lives. Not a fetch: <img src> loads it
// directly, so the heavy image bytes stay out of every JSON payload.
export function bikePhotoUrl(userId) {
  return `${BASE_URL}/users/${userId}/bike-photo`;
}

// POST /api/users/google — swaps the JWT from Google's button for our own
// user object. Creates the account on first sign-in. Fails with 401 if the
// token is not a genuine, unexpired token issued for this app.
export function googleLogin(credential) {
  return request('/users/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

// GET /api/rides — returns the full list of rides
export function getRides() {
  return request('/rides');
}

// POST /api/rides — rideData: { startPoint, destination, dateTime, rideType, pace, creatorId }
export function createRide(rideData) {
  return request('/rides', {
    method: 'POST',
    body: JSON.stringify(rideData),
  });
}

// POST /api/rides/{rideId}/join/{userId} — returns the updated ride
export function joinRide(rideId, userId) {
  return request(`/rides/${rideId}/join/${userId}`, { method: 'POST' });
}

// POST /api/rides/{rideId}/leave/{userId} — returns the updated ride
export function leaveRide(rideId, userId) {
  return request(`/rides/${rideId}/leave/${userId}`, { method: 'POST' });
}

// DELETE /api/rides/{rideId}?userId={userId} — the backend only allows
// this when userId is the ride's creator
export function deleteRide(rideId, userId) {
  return request(`/rides/${rideId}?userId=${userId}`, { method: 'DELETE' });
}

// POST /api/feedback — a logged-in user submits a suggestion/complaint.
// The backend returns 401 if userId is missing or unknown.
export function sendFeedback(userId, message) {
  return request('/feedback', {
    method: 'POST',
    body: JSON.stringify({ userId, message }),
  });
}
