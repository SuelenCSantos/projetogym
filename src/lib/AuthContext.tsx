import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '../types'
import { getUserProfile, onAuthChange } from './auth'
import { setCachedUid } from './authCache'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange(async (nextUser) => {
      setUser(nextUser)
      setCachedUid(nextUser?.uid ?? null)
      setProfile(nextUser ? await getUserProfile(nextUser.uid) : null)
      setLoading(false)
    })
    return unsub
  }, [])

  async function refreshProfile() {
    if (!user) {
      setProfile(null)
      return
    }
    setProfile(await getUserProfile(user.uid))
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
  )
}

export function useAuthContext(): AuthState {
  return useContext(AuthContext)
}
