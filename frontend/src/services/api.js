const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.token
        ? { Authorization: `Bearer ${options.token}` }
        : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || `API error: ${response.status}`);
  }

  return data;
}

export const tokenTrapApi = {
  health: () => request("/api/health"),

  // Development-only endpoints. Never use these issuers in production.
  createDemoToken: (type) => {
    if (!["genuine", "decoy"].includes(type)) {
      throw new Error("Invalid token type");
    }

    return request(`/api/demo/token/${type}`, {
      method: "POST",
    });
  },

  getAdminOverview: (token) =>
    request("/api/admin/overview", { token }),

  getDecoyDocuments: (token) =>
    request("/api/decoy/documents", { token }),

  getSecurityEvents: (token, limit = 25) =>
    request(
      `/api/monitoring/events?limit=${encodeURIComponent(limit)}`,
      { token },
    ),
};