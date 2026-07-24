import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AppNotification } from '../types'

export async function notifyLike(postAuthorUid: string, actorUid: string, postId: string): Promise<void> {
  if (!db || postAuthorUid === actorUid) return
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    recipientUid: postAuthorUid,
    actorUid,
    type: 'like',
    postId,
    read: false,
    createdAt: Date.now(),
  }
  await setDoc(doc(db, 'notifications', notification.id), notification)
}

export async function notifyComment(
  postAuthorUid: string,
  actorUid: string,
  postId: string,
  commentText: string,
): Promise<void> {
  if (!db || postAuthorUid === actorUid) return
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    recipientUid: postAuthorUid,
    actorUid,
    type: 'comment',
    postId,
    commentText,
    read: false,
    createdAt: Date.now(),
  }
  await setDoc(doc(db, 'notifications', notification.id), notification)
}

export async function notifyMessage(
  recipientUid: string,
  actorUid: string,
  conversationId: string,
): Promise<void> {
  if (!db || recipientUid === actorUid) return
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    recipientUid,
    actorUid,
    type: 'message',
    conversationId,
    read: false,
    createdAt: Date.now(),
  }
  await setDoc(doc(db, 'notifications', notification.id), notification)
}

export async function getNotifications(uid: string): Promise<AppNotification[]> {
  if (!db) return []
  const q = query(
    collection(db, 'notifications'),
    where('recipientUid', '==', uid),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as AppNotification)
}

export async function countUnreadNotifications(uid: string): Promise<number> {
  if (!db) return 0
  const q = query(
    collection(db, 'notifications'),
    where('recipientUid', '==', uid),
    where('read', '==', false),
  )
  const snap = await getCountFromServer(q)
  return snap.data().count
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  if (!db) return
  const database = db
  const q = query(
    collection(database, 'notifications'),
    where('recipientUid', '==', uid),
    where('read', '==', false),
  )
  const snap = await getDocs(q)
  if (snap.empty) return
  const batch = writeBatch(database)
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }))
  await batch.commit()
}
