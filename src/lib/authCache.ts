const KEY = 'projetogym.auth_uid'

/**
 * Mirrors the logged-in uid (or null) to localStorage so parts of the app
 * that don't load the Firebase SDK (like TodayPage) can cheaply check
 * "is someone logged in" without importing Firebase into the main bundle.
 */
export function setCachedUid(uid: string | null): void {
  try {
    if (uid) localStorage.setItem(KEY, uid)
    else localStorage.removeItem(KEY)
  } catch {
    // storage unavailable - streak sync to the social profile just won't happen
  }
}

export function getCachedUid(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
