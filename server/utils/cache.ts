import type { CacheEntry } from 'nitropack/types'

/**
 * Option `validate` de `defineCachedFunction` : plafonne l'âge d'une entrée servie
 * en stale-while-revalidate.
 *
 * Avec `swr`, Nitro sert l'entrée périmée au premier visiteur et la rafraîchit
 * ensuite en tâche de fond, quel que soit son âge. Sur un site peu fréquenté, c'est
 * presque chaque visite : le classement affichait une manche de retard pendant des
 * jours. Au-delà de `maxStale` ms, l'entrée est jugée invalide et la requête attend
 * la donnée fraîche (en cas d'échec de l'API, la requête échoue au lieu de servir
 * une donnée trop ancienne).
 */
export function freshWithin(maxStale: number) {
  return (entry: CacheEntry): boolean => entry.value !== undefined && Date.now() - (entry.mtime ?? 0) < maxStale
}
