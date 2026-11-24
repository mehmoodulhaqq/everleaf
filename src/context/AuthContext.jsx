
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setAuthError(null)
        setLoading(false)
      },
      (error) => {
        console.error('Authentication state error:', error)
        setAuthError(error)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.',
    )
  }

  return context
}
