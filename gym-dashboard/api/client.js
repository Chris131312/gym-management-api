import { endsWith } from "zod";

const BASE_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
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

  if (!response.ok) {
    const message =
      data?.error || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),

  post:
    (endpoint,
    {
      method: "POST",
      body: JSON.stringify(body),
    }),

  del: (endpoint) => request(endpoint, { method: "DELETE" }),
};
