const API_BASE = "http://localhost:5000/api";

export async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include", // Send HTTP-only session cookies
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || data.message || "An error occurred on the server.");
  }

  return data;
}