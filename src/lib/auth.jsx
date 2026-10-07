import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jobboard_user')) }
    catch { return null }
  })

  const saveSession = ({ token, user: nextUser }) => {
    localStorage.setItem('jobboard_token', token)
    localStorage.setItem('jobboard_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const login = async (email, password) => saveSession(await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }))
  const register = async (name, email, password) => saveSession(await api('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }))
  const googleLogin = async credential => saveSession(await api('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }))
  const demoLogin = () => saveSession({ token: 'preview-token', user: { id: 'preview', name: 'Alex Morgan', email: 'alex@example.com' } })
  const logout = () => { localStorage.removeItem('jobboard_token'); localStorage.removeItem('jobboard_user'); setUser(null) }

  useEffect(() => {
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!id || document.getElementById('google-identity')) return
    const script = document.createElement('script')
    script.id = 'google-identity'; script.src = 'https://accounts.google.com/gsi/client'; script.async = true
    document.head.appendChild(script)
  }, [])

  const value = useMemo(() => ({ user, login, register, googleLogin, demoLogin, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
