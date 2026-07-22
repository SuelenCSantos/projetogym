import { useEffect, useState } from 'react'
import type { Exercise } from '../types'
import { getCachedName, translateName } from './translate'

const CONCURRENCY = 5
const DELAY_BETWEEN_BATCHES_MS = 200

/**
 * Progressively translates exercise names to Portuguese in small batches so we
 * don't fire hundreds of requests at once against the free translation API.
 * Already-cached names are returned instantly; new ones stream in as they resolve.
 */
export function useTranslatedNames(exercises: Exercise[]): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false

    const seeded: Record<string, string> = {}
    const pending: Exercise[] = []
    for (const ex of exercises) {
      const cached = getCachedName(ex.id, ex.name)
      if (cached) seeded[ex.id] = cached
      else pending.push(ex)
    }
    setNames(seeded)

    async function run() {
      for (let i = 0; i < pending.length; i += CONCURRENCY) {
        if (cancelled) return
        const batch = pending.slice(i, i + CONCURRENCY)
        const results = await Promise.all(
          batch.map(async (ex) => [ex.id, await translateName(ex.id, ex.name)] as const),
        )
        if (cancelled) return
        setNames((prev) => {
          const next = { ...prev }
          for (const [id, translated] of results) next[id] = translated
          return next
        })
        if (i + CONCURRENCY < pending.length) {
          await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS))
        }
      }
    }

    if (pending.length > 0) run()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises])

  return names
}
