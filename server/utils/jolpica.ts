import type { H3Event } from 'h3'
import type {
  Constructor,
  Driver,
  QualifyingResult,
  Race,
  RaceDetail,
  RaceLink,
  Schedule,
  SeasonStandings,
  Session,
  SessionKey,
  SessionResult,
} from '#shared/types/f1'
import type { Roster } from './openf1'

/**
 * Client Jolpica F1 (successeur d'Ergast) : https://api.jolpi.ca
 * Gratuit, sans clé, limité à ~500 req/h — d'où le cache Nitro sur chaque appel.
 */
const BASE_URL = 'https://api.jolpi.ca/ergast/f1'

// --- Types bruts de l'API (sous-ensemble utilisé) ---

interface RawSession {
  date: string
  time?: string
}

interface RawDriver {
  driverId: string
  permanentNumber?: string
  code?: string
  givenName: string
  familyName: string
  nationality: string
}

interface RawConstructor {
  constructorId: string
  name: string
  nationality: string
}

interface RawResult {
  position: string
  positionText: string
  points: string
  grid: string
  laps: string
  status: string
  Driver: RawDriver
  Constructor: RawConstructor
  Time?: { millis?: string, time: string }
  FastestLap?: { rank?: string, lap?: string, Time?: { time: string } }
}

interface RawQualifyingResult {
  position: string
  Driver: RawDriver
  Constructor: RawConstructor
  Q1?: string
  Q2?: string
  Q3?: string
}

interface RawRace extends RawSession {
  season: string
  round: string
  url: string
  raceName: string
  Circuit: {
    circuitId: string
    url: string
    circuitName: string
    Location: { lat: string, long: string, locality: string, country: string }
  }
  FirstPractice?: RawSession
  SecondPractice?: RawSession
  ThirdPractice?: RawSession
  SprintQualifying?: RawSession
  SprintShootout?: RawSession
  Sprint?: RawSession
  Qualifying?: RawSession
  Results?: RawResult[]
  SprintResults?: RawResult[]
  QualifyingResults?: RawQualifyingResult[]
}

interface RawRaceTable {
  RaceTable: { season: string, Races: RawRace[] }
}

interface RawStandingsTable<T> {
  StandingsTable: {
    season: string
    round: string
    StandingsLists: T[]
  }
}

interface RawDriverStandingsList {
  season: string
  round: string
  DriverStandings: {
    position: string
    points: string
    wins: string
    Driver: RawDriver
    Constructors: RawConstructor[]
  }[]
}

interface RawConstructorStandingsList {
  season: string
  round: string
  ConstructorStandings: {
    position: string
    points: string
    wins: string
    Constructor: RawConstructor
  }[]
}

/**
 * Jolpica tolère ~4 requêtes/s par IP, et en production les IP sortantes du Worker
 * sont partagées : on limite la concurrence et on réessaie sur 429 avec un délai.
 */
const MAX_CONCURRENT = 2
const MAX_RETRIES = 3
let inFlight = 0
const waiting: (() => void)[] = []

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (inFlight >= MAX_CONCURRENT)
    await new Promise<void>(resolve => waiting.push(resolve))
  inFlight++
  try {
    return await fn()
  }
  finally {
    inFlight--
    waiting.shift()?.()
  }
}

async function jolpica<T>(path: string, attempt = 0): Promise<T> {
  try {
    const data = await withSlot(() => $fetch<{ MRData: T }>(`${BASE_URL}/${path}.json`, {
      query: { limit: 100 },
      retry: 0,
    }))
    return data.MRData
  }
  catch (error) {
    const { statusCode, response } = error as { statusCode?: number, response?: Response }
    const retryable = statusCode === 429 || (statusCode !== undefined && statusCode >= 500)
    if (!retryable || attempt >= MAX_RETRIES)
      throw error
    const retryAfter = Number(response?.headers.get('retry-after')) || 0
    await new Promise(resolve => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt))
    return jolpica<T>(path, attempt + 1)
  }
}

// --- Normalisation ---

const SESSION_LABELS: Record<SessionKey, string> = {
  fp1: 'Essais libres 1',
  fp2: 'Essais libres 2',
  fp3: 'Essais libres 3',
  sprintQualifying: 'Qualifications sprint',
  sprint: 'Sprint',
  qualifying: 'Qualifications',
  race: 'Course',
}

function toIso(session: RawSession): { at: string, hasTime: boolean } {
  return {
    at: `${session.date}T${session.time ?? '00:00:00Z'}`,
    hasTime: Boolean(session.time),
  }
}

function toSession(key: SessionKey, raw?: RawSession): Session | null {
  if (!raw)
    return null
  return { key, label: SESSION_LABELS[key], ...toIso(raw) }
}

function toRace(raw: RawRace): Race {
  const sessions = [
    toSession('fp1', raw.FirstPractice),
    toSession('fp2', raw.SecondPractice),
    toSession('fp3', raw.ThirdPractice),
    toSession('sprintQualifying', raw.SprintQualifying ?? raw.SprintShootout),
    toSession('sprint', raw.Sprint),
    toSession('qualifying', raw.Qualifying),
    toSession('race', raw),
  ]
    .filter((s): s is Session => s !== null)
    .sort((a, b) => a.at.localeCompare(b.at))

  return {
    season: raw.season,
    round: Number(raw.round),
    name: raw.raceName,
    url: raw.url,
    circuit: {
      id: raw.Circuit.circuitId,
      name: raw.Circuit.circuitName,
      locality: raw.Circuit.Location.locality,
      country: raw.Circuit.Location.country,
      url: raw.Circuit.url,
      lat: Number(raw.Circuit.Location.lat),
      lng: Number(raw.Circuit.Location.long),
    },
    at: toIso(raw).at,
    hasSprint: Boolean(raw.Sprint),
    sessions,
  }
}

function toDriver(raw: RawDriver): Driver {
  return {
    id: raw.driverId,
    code: raw.code ?? raw.familyName.slice(0, 3).toUpperCase(),
    number: raw.permanentNumber ?? '',
    firstName: raw.givenName,
    lastName: raw.familyName,
    nationality: raw.nationality,
  }
}

function toConstructor(raw: RawConstructor): Constructor {
  return { id: raw.constructorId, name: raw.name, nationality: raw.nationality }
}

function toSessionResult(raw: RawResult): SessionResult {
  const position = Number(raw.position)
  const fastestLap = raw.FastestLap?.Time?.time
    ? {
        rank: Number(raw.FastestLap.rank ?? 0),
        lap: Number(raw.FastestLap.lap ?? 0),
        time: raw.FastestLap.Time.time,
      }
    : null

  return {
    position: Number.isFinite(position) ? position : null,
    positionText: raw.positionText,
    points: Number(raw.points),
    driver: toDriver(raw.Driver),
    constructor: toConstructor(raw.Constructor),
    grid: Number(raw.grid),
    laps: Number(raw.laps),
    status: raw.status,
    time: raw.Time?.time || null,
    fastestLap,
  }
}

function toQualifyingResult(raw: RawQualifyingResult): QualifyingResult {
  return {
    position: Number(raw.position),
    driver: toDriver(raw.Driver),
    constructor: toConstructor(raw.Constructor),
    q1: raw.Q1 || null,
    q2: raw.Q2 || null,
    q3: raw.Q3 || null,
  }
}

// --- Accès aux données, avec cache ---

// Les fonctions en cache prennent l'event en premier argument : c'est ce qui permet à
// Nitro de rafraîchir une entrée périmée via `event.waitUntil`. Sans lui, le Worker
// coupe le rafraîchissement dès la réponse envoyée et l'entrée périmée est servie à vie.

const CACHE_GROUP = 'jolpica'

export const getSchedule = defineCachedFunction(async (_event: H3Event): Promise<Schedule> => {
  const data = await jolpica<RawRaceTable>('current')
  return {
    season: data.RaceTable.season,
    races: data.RaceTable.Races.map(toRace),
  }
}, {
  group: CACHE_GROUP,
  name: 'schedule',
  getKey: () => 'current',
  maxAge: 60 * 60,
  swr: true,
})

/**
 * Podiums de la saison par pilote et par écurie. Jolpica n'expose pas ce compteur,
 * mais on peut filtrer les résultats des Grands Prix par position d'arrivée (1, 2, 3).
 */
const getPodiums = defineCachedFunction(async (_event: H3Event) => {
  const podiums = { drivers: {} as Record<string, number>, constructors: {} as Record<string, number> }
  const tables = await Promise.all([1, 2, 3].map(position => jolpica<RawRaceTable>(`current/results/${position}`)))
  for (const table of tables) {
    for (const race of table.RaceTable.Races) {
      for (const result of race.Results ?? []) {
        podiums.drivers[result.Driver.driverId] = (podiums.drivers[result.Driver.driverId] ?? 0) + 1
        podiums.constructors[result.Constructor.constructorId] = (podiums.constructors[result.Constructor.constructorId] ?? 0) + 1
      }
    }
  }
  return podiums
}, {
  group: CACHE_GROUP,
  name: 'podiums',
  getKey: () => 'current',
  maxAge: 60 * 10,
  swr: true,
})

/**
 * Classements pilotes et constructeurs en un seul appel : tout passe par le même
 * limiteur de concurrence, ce qui évite de dépasser le burst de Jolpica quand la
 * page Classements se charge.
 */
export const getStandings = defineCachedFunction(async (event: H3Event): Promise<SeasonStandings> => {
  const [drivers, constructors, podiums] = await Promise.all([
    jolpica<RawStandingsTable<RawDriverStandingsList>>('current/driverstandings'),
    jolpica<RawStandingsTable<RawConstructorStandingsList>>('current/constructorstandings'),
    getPodiums(event),
  ])
  const driverList = drivers.StandingsTable.StandingsLists[0]
  const constructorList = constructors.StandingsTable.StandingsLists[0]
  return {
    drivers: {
      season: drivers.StandingsTable.season,
      round: Number(drivers.StandingsTable.round),
      items: (driverList?.DriverStandings ?? []).map(s => ({
        position: Number(s.position),
        points: Number(s.points),
        wins: Number(s.wins),
        podiums: podiums.drivers[s.Driver.driverId] ?? 0,
        driver: toDriver(s.Driver),
        // Jolpica liste les écuries dans l'ordre chronologique : la dernière est l'actuelle
        constructor: toConstructor(s.Constructors[s.Constructors.length - 1]!),
      })),
    },
    constructors: {
      season: constructors.StandingsTable.season,
      round: Number(constructors.StandingsTable.round),
      items: (constructorList?.ConstructorStandings ?? []).map(s => ({
        position: Number(s.position),
        points: Number(s.points),
        wins: Number(s.wins),
        podiums: podiums.constructors[s.Constructor.constructorId] ?? 0,
        constructor: toConstructor(s.Constructor),
      })),
    },
  }
}, {
  group: CACHE_GROUP,
  name: 'standings',
  getKey: () => 'current',
  maxAge: 60 * 10,
  swr: true,
})

/**
 * Complète avec OpenF1 les sessions terminées que Jolpica n'a pas encore publiées
 * (souvent les qualifs et la course du week-end en cours).
 */
async function withOpenF1Fallback(event: H3Event, detail: RaceDetail): Promise<RaceDetail> {
  const { race } = detail
  const started = (key: SessionKey) => race.sessions.some(s => s.key === key && Date.parse(s.at) < Date.now())
  const missing = {
    results: !detail.results && started('race'),
    qualifying: !detail.qualifying && started('qualifying'),
    sprint: race.hasSprint && !detail.sprint && started('sprint'),
  }
  if (!missing.results && !missing.qualifying && !missing.sprint)
    return detail

  try {
    // Les pilotes de la dernière course publiée, pour retrouver ids et écuries Jolpica
    const last = await jolpica<RawRaceTable>(`${race.season}/last/results`)
    const roster: Roster = new Map((last.RaceTable.Races[0]?.Results ?? []).map((r) => {
      const driver = toDriver(r.Driver)
      return [driver.code, { driver, constructor: toConstructor(r.Constructor) }]
    }))
    // En séquence, pour rester sous la limite de débit d'OpenF1
    return {
      ...detail,
      qualifying: (missing.qualifying && await getOpenF1Qualifying(event, race, roster)) || detail.qualifying,
      sprint: (missing.sprint && await getOpenF1SessionResults(event, race, 'sprint', roster)) || detail.sprint,
      results: (missing.results && await getOpenF1SessionResults(event, race, 'race', roster)) || detail.results,
    }
  }
  catch {
    // Le secours est un bonus : une erreur d'OpenF1 ne doit pas casser la page
    return detail
  }
}

export const getRaceDetail = defineCachedFunction(async (event: H3Event, round: number): Promise<RaceDetail | null> => {
  const schedule = await getSchedule(event)
  const index = schedule.races.findIndex(r => r.round === round)
  const race = schedule.races[index]
  if (!race)
    return null

  const toLink = (r?: Race): RaceLink | null => r ? { round: r.round, name: r.name } : null

  const prefix = `${race.season}/${race.round}`
  const [results, qualifying, sprint, circuitMap] = await Promise.all([
    jolpica<RawRaceTable>(`${prefix}/results`),
    jolpica<RawRaceTable>(`${prefix}/qualifying`),
    race.hasSprint ? jolpica<RawRaceTable>(`${prefix}/sprint`) : null,
    getCircuitMap(event, race.circuit),
  ])

  const resultsRaw = results.RaceTable.Races[0]?.Results
  const qualifyingRaw = qualifying.RaceTable.Races[0]?.QualifyingResults
  const sprintRaw = sprint?.RaceTable.Races[0]?.SprintResults

  const detail: RaceDetail = {
    race,
    previous: toLink(schedule.races[index - 1]),
    next: toLink(schedule.races[index + 1]),
    circuitMap,
    results: resultsRaw?.length ? resultsRaw.map(toSessionResult) : null,
    qualifying: qualifyingRaw?.length ? qualifyingRaw.map(toQualifyingResult) : null,
    sprint: sprintRaw?.length ? sprintRaw.map(toSessionResult) : null,
  }
  return withOpenF1Fallback(event, detail)
}, {
  group: CACHE_GROUP,
  name: 'race-detail',
  getKey: (_event: H3Event, round: number) => String(round),
  maxAge: 60 * 10,
  swr: true,
})
