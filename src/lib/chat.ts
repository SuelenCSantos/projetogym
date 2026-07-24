import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Conversation, Message } from '../types'

export function conversationId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_')
}

export async function getOrCreateConversation(uidA: string, uidB: string): Promise<string> {
  if (!db) throw new Error('Não configurado')
  const id = conversationId(uidA, uidB)
  const ref = doc(db, 'conversations', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const conversation: Conversation = {
      id,
      participants: [uidA, uidB].sort() as [string, string],
      lastMessageText: '',
      lastMessageAt: Date.now(),
      lastMessageSenderUid: '',
      createdAt: Date.now(),
    }
    await setDoc(ref, conversation)
  }
  return id
}

export async function sendMessage(convId: string, senderUid: string, text: string): Promise<void> {
  if (!db) throw new Error('Não configurado')
  const trimmed = text.trim()
  if (!trimmed) return

  const message: Message = {
    id: crypto.randomUUID(),
    conversationId: convId,
    senderUid,
    text: trimmed,
    createdAt: Date.now(),
  }
  await setDoc(doc(db, 'messages', message.id), message)
  await setDoc(
    doc(db, 'conversations', convId),
    { lastMessageText: trimmed, lastMessageAt: message.createdAt, lastMessageSenderUid: senderUid },
    { merge: true },
  )
}

/** Live-subscribes to a conversation's messages, oldest first. */
export function subscribeToMessages(convId: string, onChange: (messages: Message[]) => void): Unsubscribe {
  if (!db) {
    onChange([])
    return () => {}
  }
  const q = query(collection(db, 'messages'), where('conversationId', '==', convId), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data() as Message))
  })
}

export async function getConversations(uid: string): Promise<Conversation[]> {
  if (!db) return []
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as Conversation)
}
