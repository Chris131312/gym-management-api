import { getToken, clearAuth } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch {
    throw new Error("Cannot reach the server. Check your connection.");
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  // A 401 on the login form means "wrong credentials", not "session expired"
  if (response.status === 401 && endpoint !== "/auth/login") {
    clearAuth();
    window.location.href = "/";
    throw new Error("Session expired. Please log in again");
  }

  if (!response.ok) {
    const message =
      data?.error || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),

  post: (endpoint, body) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  del: (endpoint) => request(endpoint, { method: "DELETE" }),
};
