import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest, refreshSession, setAccessToken, setAuthLostHandler } from './api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuthLostHandler(() => setUser(null))
    refreshSession()                       // restaure la session via le cookie refresh
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const d = await apiRequest('/api/auth/login', { method: 'POST', body: { email, password } })
    setAccessToken(d.access_token)
    setUser(d.user)
    return d.user
  }

  const logout = async () => {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }) } catch { /* ignore */ }
    setAccessToken(null)
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>
}