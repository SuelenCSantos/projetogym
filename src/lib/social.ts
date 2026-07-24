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
import { db } from './firebase'
import { uploadToCloudinary } from './cloudinary'
import { notifyComment, notifyLike } from './notifications'
import { getUserProfile } from './auth'
import type { Comment, FollowDoc, FollowStatus, Post, UserProfile } from '../types'

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
  allowInteractions: boolean,
): Promise<Post> {
  if (!db) throw new Error('Não configurado')
  if (mediaType === 'video' && file.size > MAX_VIDEO_BYTES) {
    throw new Error('Vídeo muito grande (máximo 50MB).')
  }

  const postId = crypto.randomUUID()
  const mediaURL = await uploadToCloudinary(file, mediaType === 'photo' ? 'image' : 'video')

  const post: Post = {
    id: postId,
    authorUid,
    mediaType,
    mediaURL,
    thumbnailURL: null,
    caption,
    createdAt: Date.now(),
    allowInteractions,
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

function likeId(postId: string, uid: string): string {
  return `${postId}_${uid}`
}

export async function hasLiked(postId: string, uid: string): Promise<boolean> {
  if (!db) return false
  const snap = await getDoc(doc(db, 'likes', likeId(postId, uid)))
  return snap.exists()
}

export async function countLikes(postId: string): Promise<number> {
  if (!db) return 0
  const q = query(collection(db, 'likes'), where('postId', '==', postId))
  const snap = await getCountFromServer(q)
  return snap.data().count
}

export async function getLikers(postId: string): Promise<UserProfile[]> {
  if (!db) return []
  const q = query(collection(db, 'likes'), where('postId', '==', postId))
  const snap = await getDocs(q)
  const uids = snap.docs.map((d) => (d.data() as { uid: string }).uid)
  const profiles = await Promise.all(uids.map((uid) => getUserProfile(uid)))
  return profiles.filter((p): p is UserProfile => p !== null)
}

/** Toggles the current user's like on a post; returns the new liked state. */
export async function toggleLike(postId: string, uid: string, postAuthorUid: string): Promise<boolean> {
  if (!db) return false
  const ref = doc(db, 'likes', likeId(postId, uid))
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await deleteDoc(ref)
    return false
  }
  await setDoc(ref, { postId, uid, createdAt: Date.now() })
  await notifyLike(postAuthorUid, uid, postId)
  return true
}

export async function addComment(
  postId: string,
  commenterUid: string,
  text: string,
  postAuthorUid: string,
): Promise<Comment> {
  if (!db) throw new Error('Não configurado')
  const trimmed = text.trim()
  const comment: Comment = {
    id: crypto.randomUUID(),
    postId,
    authorUid: commenterUid,
    text: trimmed,
    createdAt: Date.now(),
  }
  await setDoc(doc(db, 'comments', comment.id), comment)
  await notifyComment(postAuthorUid, commenterUid, postId, trimmed)
  return comment
}

export async function getComments(postId: string): Promise<Comment[]> {
  if (!db) return []
  const q = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as Comment)
}

export async function countComments(postId: string): Promise<number> {
  if (!db) return 0
  const q = query(collection(db, 'comments'), where('postId', '==', postId))
  const snap = await getCountFromServer(q)
  return snap.data().count
}

export async function deleteComment(commentId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'comments', commentId))
}
