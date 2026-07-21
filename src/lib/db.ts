import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { WorkoutSession, WorkoutTemplate } from '../types'

interface GymDB extends DBSchema {
  sessions: {
    key: string
    value: WorkoutSession
    indexes: { 'by-date': string }
  }
  templates: {
    key: string
    value: WorkoutTemplate
  }
}

let dbPromise: Promise<IDBPDatabase<GymDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GymDB>('projetogym', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' })
          store.createIndex('by-date', 'date')
        }
        if (oldVersion < 2) {
          db.createObjectStore('templates', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const db = await getDB()
  await db.put('sessions', session)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('sessions', id)
}

export async function getAllSessions(): Promise<WorkoutSession[]> {
  const db = await getDB()
  const all = await db.getAll('sessions')
  return all.sort((a, b) => b.startedAt - a.startedAt)
}

export async function getSessionsByDate(date: string): Promise<WorkoutSession[]> {
  const db = await getDB()
  return db.getAllFromIndex('sessions', 'by-date', date)
}

export async function saveTemplate(template: WorkoutTemplate): Promise<void> {
  const db = await getDB()
  await db.put('templates', template)
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('templates', id)
}

export async function getAllTemplates(): Promise<WorkoutTemplate[]> {
  const db = await getDB()
  const all = await db.getAll('templates')
  return all.sort((a, b) => a.name.localeCompare(b.name))
}

export function todayLocalDate(): string {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

export function formatLocalDate(date: Date): string {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}
