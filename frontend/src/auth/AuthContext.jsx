import { createContext, useMemo, useState } from 'react'
import { apiClient } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('traceintel.user')
    if (!stored) {
      return null
    }
    try {
      return JSON.parse(stored)
    } catch {
      localStorage.removeItem('traceintel.user')
      return null
    }
  })

  async function signIn(username, password) {
    const response = await apiClient.post('/auth/login', { username, password })
    const nextUser = {
      username,
      fullName: response.data.fullName,
      role: response.data.role,
    }
    localStorage.setItem('traceintel.user', JSON.stringify(nextUser))
    localStorage.setItem('traceintel.token', response.data.token)
    setUser(nextUser)
  }

  function signOut() {
    localStorage.removeItem('traceintel.user')
    localStorage.removeItem('traceintel.token')
    setUser(null)
  }

  const value = useMemo(() => ({ user, signIn, signOut }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
