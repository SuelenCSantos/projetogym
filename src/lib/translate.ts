const CACHE_KEY = 'projetogym.instructions_pt.v1'

type TranslationCache = Record<string, string[]>

function readCache(): TranslationCache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeCache(cache: TranslationCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage full or unavailable - translation just won't persist across sessions
  }
}

async function translateLine(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-BR`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`translate failed: ${res.status}`)
  const data = await res.json()
  const translated = data?.responseData?.translatedText
  if (!translated || typeof translated !== 'string') throw new Error('empty translation')
  return translated
}

/**
 * Translates an exercise's instruction steps to Portuguese via the free MyMemory API,
 * caching results in localStorage keyed by exercise id so each exercise is only
 * translated once (and works offline afterwards). Falls back to the original
 * English line for any step that fails to translate.
 */
export async function translateInstructions(exerciseId: string, instructions: string[]): Promise<string[]> {
  if (instructions.length === 0) return []

  const cache = readCache()
  const cached = cache[exerciseId]
  if (cached && cached.length === instructions.length) return cached

  const translated = await Promise.all(
    instructions.map((line) => translateLine(line).catch(() => line)),
  )

  cache[exerciseId] = translated
  writeCache(cache)
  return translated
}
