import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Storage é o Cloudinary (ver src/lib/cloudinary.ts) - o Firebase cuida só de
// Auth e Firestore, então storageBucket nem é necessário aqui.
const config: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId)

if (!firebaseConfigured) {
  console.warn(
    'Firebase não configurado (faltam variáveis VITE_FIREBASE_*). Recursos sociais (login, seguir, feed) ficam desativados; o resto do app funciona normalmente.',
  )
}

const app = firebaseConfigured ? initializeApp(config) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const googleProvider = new GoogleAuthProvider()
