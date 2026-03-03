/**
 * Heavencraft API Client
 * Centralized fetch wrapper for all backend calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken() {
    return localStorage.getItem('hc_token')
}

function authHeaders() {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...options.headers,
        },
        ...options,
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error || 'Request failed')
    }

    return res.json()
}

// ── Auth ────────────────────────────────────────
export const authApi = {
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    login: (data) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    register: (data) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
}

// ── Server ──────────────────────────────────────
export const serverApi = {
    info: () => request('/server/info'),
    status: () => request('/server/status'),
    start: (username) => request('/server/start', {
        method: 'POST',
        body: JSON.stringify({ username }),
    }),
    stop: (username) => request('/server/stop', {
        method: 'POST',
        body: JSON.stringify({ username }),
    }),
}

// ── Players ─────────────────────────────────────
export const playerApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString()
        return request(`/players${qs ? `?${qs}` : ''}`)
    },
    get: (id) => request(`/players/${id}`),
    update: (id, data) => request(`/players/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
}

// ── Leaderboard ─────────────────────────────────
export const leaderboardApi = {
    get: (metric = 'kills', limit = 10) =>
        request(`/leaderboard?metric=${metric}&limit=${limit}`),
}

// ── Mods ────────────────────────────────────────
export const modApi = {
    list: (category) => {
        const qs = category ? `?category=${category}` : ''
        return request(`/mods${qs}`)
    },
    get: (id) => request(`/mods/${id}`),
    create: (data) => request('/mods', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    delete: (id) => request(`/mods/${id}`, { method: 'DELETE' }),
}

// ── Activity ────────────────────────────────────
export const activityApi = {
    list: (limit = 20, type) => {
        const params = new URLSearchParams({ limit: String(limit) })
        if (type) params.set('type', type)
        return request(`/activity?${params}`)
    },
    create: (data) => request('/activity', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
}

// ── Stats ───────────────────────────────────────
export const statsApi = {
    network: () => request('/stats/network'),
    top: () => request('/stats/top'),
}

// ── Map ─────────────────────────────────────────
export const mapApi = {
    chunks: (cx = 0, cz = 0, radius = 16) =>
        request(`/map/chunks?cx=${cx}&cz=${cz}&radius=${radius}`),
    pois: () => request('/map/pois'),
    villages: (x, z) => request(`/map/villages?x=${x}&z=${z}`),
}

// ── Users ───────────────────────────────────────
export const userApi = {
    list: () => request('/users'),
    updateProfile: (data) => request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    updateRole: (targetUserId, role) => request('/users/role', {
        method: 'PATCH',
        body: JSON.stringify({ targetUserId, role }),
    }),
}

// ── Contact ─────────────────────────────────────
export const contactApi = {
    submit: (data) => request('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    list: () => request('/contact'),
}
