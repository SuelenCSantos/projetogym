import { AuthProvider } from '../lib/AuthContext'
import { SocialGate } from './SocialGate'
import { FeedPage } from '../pages/FeedPage'
import { ProfilePage } from '../pages/ProfilePage'

interface Props {
  view: 'feed' | 'profile'
}

export default function SocialSection({ view }: Props) {
  return (
    <AuthProvider>
      <SocialGate>{view === 'feed' ? <FeedPage /> : <ProfilePage />}</SocialGate>
    </AuthProvider>
  )
}
