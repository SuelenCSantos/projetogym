import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from './firebase'
import type { FollowDoc, FollowStatus, Post, UserProfile } from '../types'

function followId(followerUid: string, targetUid: string): string {
  return `${followerUid}_${targetUid}`
}

export async function followUser(followerUid: string, target: UserProfile): Promise<FollowDoc> {
  if (!db) throw new Error('Não configurado')
  const status: FollowStatus = target.isPrivate ? 'pending' : 'accepted'
  const data: FollowDoc = { followerUid, targetUid: target.uid, status, createdAt: Date.now() }
  await setDoc(doc(db, 'follows', followId(followerUid, target.uid)), data)
  return data
}

export async function unfollowUser(followerUid: string, targetUid: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'follows', followId(followerUid, targetUid)))
}

export async function getFollowStatus(followerUid: string, targetUid: string): Promise<FollowStatus | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'follows', followId(followerUid, targetUid)))
  return snap.exists() ? (snap.data() as FollowDoc).status : null
}

export async function acceptFollowRequest(followerUid: string, targetUid: string): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'follows', followId(followerUid, targetUid)), { status: 'accepted' }, { merge: true })
}

export async function rejectFollowRequest(followerUid: string, targetUid: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'follows', followId(followerUid, targetUid)))
}

export async function removeFollower(followerUid: string, targetUid: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'follows', followId(followerUid, targetUid)))
}

export async function getPendingRequests(targetUid: string): Promise<FollowDoc[]> {
  if (!db) return []
  const q = query(
    collection(db, 'follows'),
    where('targetUid', '==', targetUid),
    where('status', '==', 'pending'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as FollowDoc)
}

export async function getFollowingIds(uid: string): Promise<string[]> {
  if (!db) return []
  const q = query(collection(db, 'follows'), where('followerUid', '==', uid), where('status', '==', 'accepted'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => (d.data() as FollowDoc).targetUid)
}

export async function getFollowerIds(uid: string): Promise<string[]> {
  if (!db) return []
  const q = query(collection(db, 'follows'), where('targetUid', '==', uid), where('status', '==', 'accepted'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => (d.data() as FollowDoc).followerUid)
}

export async function countFollowers(uid: string): Promise<number> {
  if (!db) return 0
  const q = query(collection(db, 'follows'), where('targetUid', '==', uid), where('status', '==', 'accepted'))
  const snap = await getCountFromServer(q)
  return snap.data().count
}

export async function countFollowing(uid: string): Promise<number> {
  if (!db) return 0
  const q = query(collection(db, 'follows'), where('followerUid', '==', uid), where('status', '==', 'accepted'))
  const snap = await getCountFromServer(q)
  return snap.data().count
}

export async function searchUsersByUsernamePrefix(prefix: string): Promise<UserProfile[]> {
  if (!db) return []
  const lower = prefix.trim().toLowerCase()
  if (!lower) return []
  const q = query(
    collection(db, 'users'),
    where('usernameLower', '>=', lower),
    where('usernameLower', '<=', lower + ''),
    fbLimit(20),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as UserProfile)
}

const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export async function createPost(
  authorUid: string,
  file: File,
  mediaType: 'photo' | 'video',
  caption: string,
): Promise<Post> {
  if (!db || !storage) throw new Error('Não configurado')
  if (mediaType === 'video' && file.size > MAX_VIDEO_BYTES) {
    throw new Error('Vídeo muito grande (máximo 50MB).')
  }

  const postId = crypto.randomUUID()
  const storageRef = ref(storage, `posts/${authorUid}/${postId}/${file.name}`)
  await uploadBytes(storageRef, file)
  const mediaURL = await getDownloadURL(storageRef)

  const post: Post = {
    id: postId,
    authorUid,
    mediaType,
    mediaURL,
    thumbnailURL: null,
    caption,
    createdAt: Date.now(),
  }
  await setDoc(doc(db, 'posts', postId), post)
  return post
}

export async function getFeedPosts(authorUids: string[]): Promise<Post[]> {
  if (!db || authorUids.length === 0) return []
  const database = db
  const chunks: string[][] = []
  for (let i = 0; i < authorUids.length; i += 30) chunks.push(authorUids.slice(i, i + 30))

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const q = query(
        collection(database, 'posts'),
        where('authorUid', 'in', chunk),
        orderBy('createdAt', 'desc'),
        fbLimit(50),
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => d.data() as Post)
    }),
  )
  return results.flat().sort((a, b) => b.createdAt - a.createdAt)
}

export async function getUserPosts(uid: string): Promise<Post[]> {
  if (!db) return []
  const q = query(collection(db, 'posts'), where('authorUid', '==', uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as Post)
}

export async function deletePost(postId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'posts', postId))
}
