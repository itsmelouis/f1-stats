import type { H3Event } from 'h3'
import type { CacheEntry } from 'nitropack/types'

interface LiveCacheOptions<A extends [H3Event, ...unknown[]]> {
  group: string
  name: string
  getKey: (...args: A) => string
  /** Âge (s) à partir duquel l'entrée est rafraîchie en tâche de fond */
  maxAge: number
  /** Âge (ms) au-delà duquel la requête attend la donnée fraîche au lieu de servir l'entrée */
  maxStale: number
}

/**
 * `defineCachedFunction` en stale-while-revalidate, avec un plafond de fraîcheur
 * et un repli sur la dernière valeur connue.
 *
 * Avec `swr`, Nitro sert l'entrée périmée au premier visiteur et la rafraîchit
 * ensuite en tâche de fond, quel que soit son âge. Sur un site peu fréquenté, c'est
 * presque chaque visite : le classement affichait une manche de retard pendant des
 * jours. Au-delà de `maxStale`, la requête attend donc la donnée fraîche.
 *
 * Si ce rafraîchissement échoue (Jolpica répond souvent 429 au Worker, voir
 * `jolpica.ts`), on sert quand même la dernière valeur connue, quel que soit son
 * âge : une donnée en retard vaut mieux qu'une page en erreur. Nitro ne supprime
 * pas l'entrée qu'il juge invalide, on la relit directement dans le stockage.
 */
export function defineLiveCachedFunction<T, A extends [H3Event, ...unknown[]]>(
  fn: (...args: A) => Promise<T>,
  { maxStale, ...opts }: LiveCacheOptions<A>,
) {
  const cached = defineCachedFunction(fn, {
    ...opts,
    swr: true,
    validate: (entry: CacheEntry<T>, ..._args: A) => entry.value !== undefined && Date.now() - (entry.mtime ?? 0) < maxStale,
  })

  return async (...args: A): Promise<T> => {
    try {
      return await cached(...args)
    }
    catch (error) {
      // Clé construite comme dans `defineCachedFunction` (base `/cache` par défaut)
      const key = `/cache:${opts.group}:${opts.name}:${opts.getKey(...args)}.json`
      const entry = await useStorage().getItem<CacheEntry<T>>(key).catch(() => null)
      if (!entry || entry.value === undefined)
        throw error
      console.warn(`[cache] ${key} : rafraîchissement impossible, valeur du ${new Date(entry.mtime ?? 0).toISOString()} servie`, error)
      return entry.value
    }
  }
}
