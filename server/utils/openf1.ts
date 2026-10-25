import type { Constructor, Driver, QualifyingResult, Race, SessionResult } from '#shared/types/f1'

/**
 * Client OpenF1 : https://openf1.org
 * Jolpica publie souvent les résultats d'un week-end avec du retard, alors qu'OpenF1
 * les a dès la fin de chaque session. On ne s'en sert qu'en secours, pour les sessions
 * terminées que Jolpica n'a pas encore. Gratuit, sans clé, limité à 3 req/s et 30 req/min,
 * réservé à un usage non commercial ; la mention n'est pas obligatoire mais on la fait (page Sources).
 */
const BASE_URL = 'https://api.openf1.org/v1'

// --- Types bruts de l'API (sous-ensemble utilisé) ---

interface RawSession {
  session_key: number
  session_name: string
  date_start: string
  date_end: string
}

interface RawDriver {
  driver_number: number
  name_acronym: string
  first_name: string
  last_name: string
  team_name: string
}

interface RawResult {
  position: number | null
  driver_number: number
  number_of_laps: number
  points?: number
  dnf: boolean
  dns: boolean
  dsq: boolean
  /** Secondes ; tableau [Q1, Q2, Q3] en qualifications */
  duration: number | (number | null)[] | null
  /** Secondes, ou « +1 LAP » pour un pilote doublé */
  gap_to_leader: number | string | null
}

/** OpenF1 répond 404 quand une requête ne trouve rien : c'est une liste vide. */
async function openf1<T>(path: string, query: Record<string, string | number>): Promise<T[]> {
  try {
    return await $fetch<T[]>(`${BASE_URL}/${path}`, {
      query,
      retry: 2,
      retryDelay: 1000,
      retryStatusCodes: [429, 500, 502, 503, 504],
    })
  }
  catch (error) {
    if ((error as { statusCode?: number }).statusCode === 404)
      return []
    throw error
  }
}

const getSessions = defineCachedFunction(
  (year: string) => openf1<RawSession>('sessions', { year }),
  { group: 'openf1', name: 'sessions', getKey: (year: string) => year, maxAge: 60 * 60, swr: true },
)

// --- Normalisation ---

/** 94.035 → « 1:34.035 », 6120.785 → « 1:42:00.785 », comme Jolpica */
function formatSeconds(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = (seconds % 60).toFixed(3)
  if (hours > 0)
    return `${hours}:${String(minutes).padStart(2, '0')}:${rest.padStart(6, '0')}`
  if (minutes > 0)
    return `${minutes}:${rest.padStart(6, '0')}`
  return rest
}

function status(raw: RawResult) {
  if (raw.dsq)
    return 'Disqualified'
  if (raw.dns)
    return 'Did not start'
  if (raw.dnf)
    return 'Retired'
  const lapped = typeof raw.gap_to_leader === 'string' && raw.gap_to_leader.match(/^\+(\d+) LAPS?$/)
  if (lapped)
    return `+${lapped[1]} Lap${lapped[1] === '1' ? '' : 's'}`
  return 'Finished'
}

function positionText(raw: RawResult) {
  if (raw.position !== null)
    return String(raw.position)
  if (raw.dsq)
    return 'D'
  if (raw.dns)
    return 'W'
  return 'R'
}

/** Pilotes et écuries au format Jolpica, indexés par trigramme, pour garder ids et couleurs. */
export type Roster = Map<string, { driver: Driver, constructor: Constructor }>

function identify(raw: RawDriver | undefined, roster: Roster) {
  const known = raw && roster.get(raw.name_acronym)
  if (known)
    return known
  return {
    driver: {
      id: raw?.name_acronym.toLowerCase() ?? '',
      code: raw?.name_acronym ?? '',
      number: String(raw?.driver_number ?? ''),
      firstName: raw?.first_name ?? '',
      lastName: raw?.last_name ?? '',
      nationality: '',
    },
    constructor: {
      id: raw?.team_name.toLowerCase().replace(/\W+/g, '_') ?? '',
      name: raw?.team_name ?? '',
      nationality: '',
    },
  }
}

// --- Accès aux données ---

const SESSION_NAMES = { sprint: 'Sprint', qualifying: 'Qualifying', race: 'Race' } as const

/** L'offre gratuite ne sert une session que 30 min après sa fin (avant, c'est du « live » payant). */
const LIVE_DELAY = 30 * 60 * 1000

/** Résultats bruts d'une session terminée du week-end, `null` si OpenF1 ne l'a pas. */
async function fetchSession(race: Race, key: keyof typeof SESSION_NAMES) {
  const at = race.sessions.find(s => s.key === key)?.at
  if (!at)
    return null
  const sessions = await getSessions(race.season)
  // Même horaire de départ des deux côtés ; on tolère un léger écart
  const session = sessions.find(s => s.session_name === SESSION_NAMES[key]
    && Math.abs(Date.parse(s.date_start) - Date.parse(at)) < 60 * 60 * 1000)
  if (!session || Date.parse(session.date_end) + LIVE_DELAY > Date.now())
    return null

  // En séquence, pour rester sous la limite de débit
  const results = await openf1<RawResult>('session_result', { session_key: session.session_key })
  if (!results.length)
    return null
  const drivers = await openf1<RawDriver>('drivers', { session_key: session.session_key })
  const byNumber = new Map(drivers.map(d => [d.driver_number, d]))
  return { results, driverOf: (raw: RawResult) => byNumber.get(raw.driver_number) }
}

export async function getOpenF1SessionResults(race: Race, key: 'sprint' | 'race', roster: Roster): Promise<SessionResult[] | null> {
  const session = await fetchSession(race, key)
  if (!session)
    return null
  return session.results.map((raw) => {
    const gap = raw.gap_to_leader
    return {
      position: raw.position,
      positionText: positionText(raw),
      points: raw.points ?? 0,
      ...identify(session.driverOf(raw), roster),
      // OpenF1 ne fournit pas la grille de départ en 2026
      grid: 0,
      laps: raw.number_of_laps,
      status: status(raw),
      time: raw.position === 1 && typeof raw.duration === 'number'
        ? formatSeconds(raw.duration)
        : typeof gap === 'number' ? `+${formatSeconds(gap)}` : null,
      fastestLap: null,
    }
  })
}

export async function getOpenF1Qualifying(race: Race, roster: Roster): Promise<QualifyingResult[] | null> {
  const session = await fetchSession(race, 'qualifying')
  if (!session)
    return null
  return session.results.map((raw, index) => {
    const [q1, q2, q3] = Array.isArray(raw.duration) ? raw.duration : []
    return {
      position: raw.position ?? index + 1,
      ...identify(session.driverOf(raw), roster),
      q1: q1 ? formatSeconds(q1) : null,
      q2: q2 ? formatSeconds(q2) : null,
      q3: q3 ? formatSeconds(q3) : null,
    }
  })
}
