const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.detail || data.message || `Request failed (${response.status})`
        : `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

export const api = {
  health: () => request("/api/health"),

  events: () => request("/api/monitoring/events"),

  createDemoToken: (tokenType) =>
    request(`/api/demo/token/${encodeURIComponent(tokenType)}`, {
      method: "POST",
    }),

  adminOverview: (token) =>
    request("/api/admin/overview", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  decoyDocuments: (token) =>
    request("/api/decoy/documents", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};