const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const token = options.token;
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.detail || data.message || `Request failed (${response.status})`
        : `Request failed (${response.status})`;

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  health: () => request("/api/health"),

  login: (credentials) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: (token) =>
    request("/api/auth/logout", {
      method: "POST",
      token,
    }),

  events: (token, params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", params.limit);
    if (params.severity && params.severity !== "ALL")
      query.set("severity", params.severity);
    if (params.event_type && params.event_type !== "ALL")
      query.set("event_type", params.event_type);
    if (params.environment && params.environment !== "ALL")
      query.set("environment", params.environment);
    if (params.search) query.set("search", params.search);

    const qs = query.toString();
    return request(`/api/monitoring/events${qs ? `?${qs}` : ""}`, { token });
  },

  summary: (token) => request("/api/monitoring/summary", { token }),

  adminOverview: (token) => request("/api/admin/overview", { token }),

  decoyDocuments: (token) => request("/api/decoy/documents", { token }),

  activateDecoyResource: (token, resourceId) =>
    request(`/api/decoy/resources/${encodeURIComponent(resourceId)}/activate`, {
      method: "POST",
      token,
    }),

  chatWithAi: (message, apiKey, history = [], context = {}) =>
    request("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        api_key: apiKey || undefined,
        history,
        context,
      }),
    }),

  createDemoToken: (tokenType) =>
    request(`/api/demo/token/${encodeURIComponent(tokenType)}`, {
      method: "POST",
    }),
};