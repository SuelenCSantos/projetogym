import type { Exercise } from '../types'

const JSON_URL =
  'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json'
const IMAGE_BASE =
  'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'

const CACHE_KEY = 'projetogym.exercises.v1'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14 // 14 days

interface CachedPayload {
  fetchedAt: number
  data: Exercise[]
}

export function imageUrl(path: string): string {
  return IMAGE_BASE + path
}

async function fetchFromNetwork(): Promise<Exercise[]> {
  const res = await fetch(JSON_URL)
  if (!res.ok) throw new Error(`Falha ao buscar exercícios: ${res.status}`)
  return (await res.json()) as Exercise[]
}

function readCache(): CachedPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CachedPayload
  } catch {
    return null
  }
}

function writeCache(data: Exercise[]) {
  try {
    const payload: CachedPayload = { fetchedAt: Date.now(), data }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage full or unavailable - ignore, in-memory data still works this session
  }
}

export async function loadExercises(): Promise<Exercise[]> {
  const cached = readCache()
  const isFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS

  if (isFresh) {
    // refresh silently in background without blocking the UI
    fetchFromNetwork().then(writeCache).catch(() => {})
    return cached!.data
  }

  try {
    const data = await fetchFromNetwork()
    writeCache(data)
    return data
  } catch (err) {
    if (cached) return cached.data
    throw err
  }
}

export const MUSCLE_LABELS_PT: Record<string, string> = {
  abdominals: 'Abdômen',
  abductors: 'Abdutores (quadril)',
  adductors: 'Adutores (coxa interna)',
  biceps: 'Bíceps',
  calves: 'Panturrilhas',
  chest: 'Peitoral',
  forearms: 'Antebraços',
  glutes: 'Glúteos',
  hamstrings: 'Posterior de coxa',
  lats: 'Dorsais (costas)',
  'lower back': 'Lombar',
  'middle back': 'Meio das costas',
  neck: 'Pescoço',
  quadriceps: 'Quadríceps',
  shoulders: 'Ombros',
  traps: 'Trapézio',
  triceps: 'Tríceps',
}

export function muscleLabel(muscle: string): string {
  return MUSCLE_LABELS_PT[muscle] ?? muscle
}

export const EQUIPMENT_LABELS_PT: Record<string, string> = {
  'body only': 'Peso do corpo',
  machine: 'Máquina',
  other: 'Outro',
  'foam roll': 'Rolo de espuma',
  kettlebells: 'Kettlebell',
  dumbbell: 'Halteres',
  cable: 'Cabo/Polia',
  barbell: 'Barra',
  bands: 'Elástico',
  'medicine ball': 'Bola medicinal',
  'exercise ball': 'Bola suíça',
  'e-z curl bar': 'Barra W',
  none: 'Nenhum',
}

export function equipmentLabel(equipment: string | null): string {
  if (!equipment) return 'Nenhum'
  return EQUIPMENT_LABELS_PT[equipment] ?? equipment
}

export const LEVEL_LABELS_PT: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  expert: 'Avançado',
}

export function levelLabel(level: string): string {
  return LEVEL_LABELS_PT[level] ?? level
}

export const CATEGORY_LABELS_PT: Record<string, string> = {
  strength: 'Força',
  stretching: 'Alongamento',
  plyometrics: 'Pliometria',
  strongman: 'Strongman',
  powerlifting: 'Levantamento de peso',
  cardio: 'Cardio',
  'olympic weightlifting': 'Halterofilismo olímpico',
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS_PT[category] ?? category
}

export function allMuscles(exercises: Exercise[]): string[] {
  const set = new Set<string>()
  for (const ex of exercises) {
    ex.primaryMuscles.forEach((m) => set.add(m))
    ex.secondaryMuscles.forEach((m) => set.add(m))
  }
  return Array.from(set).sort((a, b) => muscleLabel(a).localeCompare(muscleLabel(b)))
}

export function allEquipment(exercises: Exercise[]): string[] {
  const set = new Set<string>()
  for (const ex of exercises) {
    if (ex.equipment) set.add(ex.equipment)
  }
  return Array.from(set).sort((a, b) => equipmentLabel(a).localeCompare(equipmentLabel(b)))
}
