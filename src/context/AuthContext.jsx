'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [ready, setReady]     = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('classiq_user'))) } catch { setUser(null) }
    setReady(true)
  }, [])

  const login = async (credentials) => {
    setLoading(true)
    try {
      const { data } = await authApi.login(credentials)
      if (data.token) {
        localStorage.setItem('classiq_token', data.token)
        localStorage.setItem('classiq_user', JSON.stringify(data.user))
        setUser(data.user)
      }
      return data
    } finally {
      setLoading(false)
    }
  }

  const adminLogin = async (credentials) => {
    setLoading(true)
    try {
      const { data } = await authApi.adminLogin(credentials)
      if (data.token) {
        localStorage.setItem('classiq_token', data.token)
        localStorage.setItem('classiq_user', JSON.stringify(data.user))
        setUser(data.user)
      }
      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('classiq_token')
    localStorage.removeItem('classiq_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, ready, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
