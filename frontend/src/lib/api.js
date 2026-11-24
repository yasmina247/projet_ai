const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

let accessToken = null
let onAuthLost = () => {}
export const setAccessToken = (t) => { accessToken = t }
export const setAuthLostHandler = (fn) => { onAuthLost = fn }

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

function parseError(data, status) {
  const d = data?.detail
  if (typeof d === 'string') return new ApiError(d, status)
  if (Array.isArray(d)) return new ApiError((d[0]?.msg || 'Données invalides.').replace(/^Value error, /, ''), status)
  if (d && typeof d === 'object') return new ApiError(d.message || 'Erreur.', status, d.code)
  return new ApiError('Erreur serveur. Réessayez.', status)
}

const send = (path, { method = 'GET', body, token } = {}) =>
  fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

let refreshing = null
export function refreshSession() {
  refreshing ||= send('/api/auth/refresh', { method: 'POST' })
    .then(async (r) => {
      if (!r.ok) throw new ApiError('Session expirée.', 401)
      const d = await r.json()
      accessToken = d.access_token
      return d
    })
    .finally(() => { refreshing = null })
  return refreshing
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  let res
  try {
    res = await send(path, { method, body, token: token ?? accessToken })
  } catch {
    throw new ApiError('Serveur injoignable.', 0)
  }
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    try {
      await refreshSession()
      res = await send(path, { method, body, token: accessToken })
    } catch {
      accessToken = null
      onAuthLost()
      throw new ApiError('Session expirée. Veuillez vous reconnecter.', 401)
    }
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw parseError(data, res.status)
  return data
}