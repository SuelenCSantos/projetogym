import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, firebaseConfigured } from './firebase'
import type { UserProfile } from '../types'

export { firebaseConfigured }

export function onAuthChange(cb: (user: User | null) => void): () => void {
  if (!auth) {
    cb(null)
    return () => {}
  }
  return onAuthStateChanged(auth, cb)
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  if (!auth) throw new Error('Login não configurado.')
  await createUserWithEmailAndPassword(auth, email, password)
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  if (!auth) throw new Error('Login não configurado.')
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signInWithGoogle(): Promise<void> {
  if (!auth) throw new Error('Login não configurado.')
  await signInWithPopup(auth, googleProvider)
}

export async function signOutUser(): Promise<void> {
  if (!auth) return
  await signOut(auth)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  if (!db) return null
  const lower = username.trim().toLowerCase()
  const usernameSnap = await getDoc(doc(db, 'usernames', lower))
  if (!usernameSnap.exists()) return null
  const uid = (usernameSnap.data() as { uid: string }).uid
  return getUserProfile(uid)
}

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/

export function validateUsername(username: string): string | null {
  if (!USERNAME_RE.test(username.toLowerCase())) {
    return 'Use de 3 a 20 letras minúsculas, números, "." ou "_"'
  }
  return null
}

/** Atomically reserves a unique username and creates the user's profile doc. */
export async function claimUsername(uid: string, username: string, displayName: string): Promise<void> {
  if (!db) throw new Error('Login não configurado.')
  const invalid = validateUsername(username)
  if (invalid) throw new Error(invalid)

  const lower = username.toLowerCase()
  const database = db
  await runTransaction(database, async (tx) => {
    const usernameRef = doc(database, 'usernames', lower)
    const existing = await tx.get(usernameRef)
    if (existing.exists()) {
      throw new Error('Esse nome de usuário já está em uso.')
    }
    const profile: UserProfile = {
      uid,
      username,
      usernameLower: lower,
      displayName,
      photoURL: null,
      isPrivate: false,
      currentStreak: 0,
      lastWorkoutDate: null,
      createdAt: Date.now(),
    }
    tx.set(usernameRef, { uid })
    tx.set(doc(database, 'users', uid), profile)
  })
}

export async function updateProfileFields(
  uid: string,
  fields: Partial<
    Pick<
      UserProfile,
      'displayName' | 'photoURL' | 'isPrivate' | 'allowInteractions' | 'currentStreak' | 'lastWorkoutDate'
    >
  >,
): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid), fields, { merge: true })
}
