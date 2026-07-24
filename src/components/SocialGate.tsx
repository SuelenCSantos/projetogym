import type { ReactNode } from 'react'
import { useAuthContext } from '../lib/AuthContext'
import { AuthGate } from './AuthGate'
import { OnboardingUsername } from './OnboardingUsername'

/** Wraps a tab that needs a logged-in, onboarded user (Feed/Perfil). */
export function SocialGate({ children }: { children: ReactNode }) {
  const { user, profile, loading, refreshProfile } = useAuthContext()

  if (loading) {
    return <div className="p-4 text-slate-500">Carregando...</div>
  }
  if (!user) {
    return <AuthGate />
  }
  if (!profile) {
    return <OnboardingUsername user={user} onDone={refreshProfile} />
  }
  return <>{children}</>
}
