import type { Race } from '#shared/types/f1'

export type RaceStatus = 'past' | 'next' | 'upcoming'

/** Statut d'une manche par rapport à l'instant `now` (ISO 8601) et à la prochaine course. */
export function raceStatus(race: Race, now: string, nextRound?: number): RaceStatus {
  if (race.at < now)
    return 'past'
  return race.round === nextRound ? 'next' : 'upcoming'
}

/** Regroupe les manches par mois (libellé français), dans l'ordre du calendrier. */
export function groupRacesByMonth(races: Race[]) {
  const groups: { month: string, races: Race[] }[] = []
  for (const race of races) {
    const month = formatDate(race.at, { month: 'long', year: 'numeric' })
    const group = groups.find(g => g.month === month)
    if (group)
      group.races.push(race)
    else
      groups.push({ month, races: [race] })
  }
  return groups
}
