import { getToken, clearAuth } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...BASE_URL(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  let data = null;
  const text = await response.text();
  if (text) {
    data = JSON.parse(text);
  }

  if (response.status === 401) {
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
