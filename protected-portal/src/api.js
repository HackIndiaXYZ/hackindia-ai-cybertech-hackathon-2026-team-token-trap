const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const token = options.token
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text()

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.detail || data.message || `Request failed (${response.status})`
        : `Request failed (${response.status})`

    const err = new Error(message)
    err.status = response.status
    throw err
  }

  return data
}

export const portalApi = {
  health: () => request('/api/health'),

  login: (email, password, mode) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, mode }),
    }),

  logout: (token) =>
    request('/api/auth/logout', {
      method: 'POST',
      token,
    }),

  getAdminOverview: (token) => request('/api/admin/overview', { token }),

  getDecoyDocuments: (token) => request('/api/decoy/documents', { token }),

  activateResource: (token, resourceId) =>
    request(`/api/decoy/resources/${encodeURIComponent(resourceId)}/activate`, {
      method: 'POST',
      token,
    }),

  getSandboxOverview: (token) => request('/api/sandbox/overview', { token }),

  getSandboxTables: (token) => request('/api/sandbox/tables', { token }),

  getSandboxTableRecords: (token, tableName) =>
    request(`/api/sandbox/tables/${encodeURIComponent(tableName)}/records`, { token }),

  executeSandboxQuery: (token, query) =>
    request('/api/sandbox/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
      token,
    }),

  exportSandboxTable: (token, tableName, format = 'sql') =>
    request('/api/sandbox/export', {
      method: 'POST',
      body: JSON.stringify({ table_name: tableName, format }),
      token,
    }),
}
