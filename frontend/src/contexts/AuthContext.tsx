import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser, logout as apiLogout } from '../lib/api'
import { queryClient } from '../main'

interface User {
  id: string
  spotifyId: string
  email?: string
  username?: string | null
  displayName?: string
  avatarUrl?: string
  bio?: string
  isProfilePublic?: boolean
  favoriteGenres: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const { data } = await getCurrentUser()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      // Wyczysc cache zapytan, zeby nie bylo starych danych
      queryClient.clear()
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      logout,
      refetchUser: fetchUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

