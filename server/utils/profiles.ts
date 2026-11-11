import type { H3Event } from 'h3'
import type {
  ConstructorCareer,
  ConstructorSeason,
  DriverCareer,
  DriverSeason,
  DriverSeasonSummary,
  RaceStats,
  RoundEntry,
  SeasonRound,
  SeasonStanding,
} from '#shared/types/f1'
import type {
  RawConstructor,
  RawConstructorStandingsList,
  RawDriver,
  RawDriverStandingsList,
  RawRace,
  RawResult,
  RawStandingsTable,
} from './jolpica'
import { CONSTRUCTOR_CHAMPIONS, DRIVER_CHAMPIONS, LAST_KNOWN_CHAMPIONS_SEASON } from './champions'
import { CACHE_GROUP, jolpica, jolpicaCount, jolpicaPages, jolpicaRaces, MAX_STALE, toConstructor, toDriver } from './jolpica'

/**
 * Fiches pilote et écurie : carrière complète, ou une saison en détail.
 * Chaque fiche coûte quelques appels Jolpica au plus (voir les limites de débit
 * dans `jolpica.ts`), d'où des compteurs lus via `total` plutôt que des listes
 * complètes quand c'est possible.
 */

/** Les sprints n'existent que depuis 2021 : inutile de les demander avant */
const FIRST_SPRINT_SEASON = 2021

const DAY = 24 * 60 * 60

// --- Palmarès ---

interface Champions {
  drivers: Record<string, string>
  constructors: Record<string, string>
}

/** Champions par saison : le palmarès figé, complété par les saisons terminées depuis. */
const getChampions = defineCachedFunction(async (event: H3Event): Promise<Champions> => {
  const schedule = await getSchedule(event)
  const current = Number(schedule.season)
  const champions = { drivers: { ...DRIVER_CHAMPIONS }, constructors: { ...CONSTRUCTOR_CHAMPIONS } }

  for (let season = LAST_KNOWN_CHAMPIONS_SEASON + 1; season <= current; season++) {
    const [drivers, constructors] = await Promise.all([
      jolpica<RawStandingsTable<RawDriverStandingsList>>(`${season}/driverstandings/1`),
      jolpica<RawStandingsTable<RawConstructorStandingsList>>(`${season}/constructorstandings/1`),
    ])
    // Pas de champion tant que la saison en cours n'est pas allée au bout
    if (season === current && Number(drivers.StandingsTable.round) < schedule.races.length)
      continue
    const driver = drivers.StandingsTable.StandingsLists[0]?.DriverStandings[0]
    const constructor = constructors.StandingsTable.StandingsLists[0]?.ConstructorStandings[0]
    if (driver)
      champions.drivers[season] = driver.Driver.driverId
    if (constructor)
      champions.constructors[season] = constructor.Constructor.constructorId
  }
  return champions
}, {
  group: CACHE_GROUP,
  name: 'champions',
  getKey: () => 'all',
  maxAge: 6 * 60 * 60,
  swr: true,
  validate: freshWithin(DAY * 1000),
})

function titlesOf(champions: Record<string, string>, id: string) {
  return Object.keys(champions).filter(season => champions[season] === id).sort()
}

// --- Normalisation ---

/**
 * Lien externe venu de l'API, rendu tel quel dans un `href` : seul `https:` passe
 * (un `javascript:` exécuterait du code au clic). Jolpica donne souvent des liens
 * Wikipédia en `http:`, qu'on passe en `https:` ; le reste devient une chaîne vide.
 */
function httpsUrl(url: string | undefined) {
  try {
    const parsed = new URL(url ?? '')
    if (parsed.protocol === 'http:')
      parsed.protocol = 'https:'
    return parsed.protocol === 'https:' ? parsed.href : ''
  }
  catch {
    return ''
  }
}

function finishedWithin(result: RawResult, max: number) {
  return /^\d+$/.test(result.positionText) && Number(result.positionText) <= max
}

/** Compteurs en Grand Prix ; pour une écurie, chaque voiture compte. */
function countStats(races: RawRace[]): RaceStats {
  const results = races.flatMap(race => race.Results ?? [])
  return {
    races: races.length,
    wins: results.filter(r => finishedWithin(r, 1)).length,
    podiums: results.filter(r => finishedWithin(r, 3)).length,
    poles: results.filter(r => r.grid === '1').length,
    fastestLaps: results.filter(r => r.FastestLap?.rank === '1').length,
  }
}

/** Manches de la saison, avec les points du sprint ajoutés à ceux du Grand Prix. */
function toRounds(races: RawRace[], sprints: RawRace[]): SeasonRound[] {
  const sprintPoints = new Map<string, number>()
  for (const sprint of sprints) {
    for (const result of sprint.SprintResults ?? [])
      sprintPoints.set(`${sprint.round}/${result.Driver.driverId}`, Number(result.points))
  }

  return races
    .map((race) => {
      const entries = (race.Results ?? []).map((result): RoundEntry => ({
        driver: toDriver(result.Driver),
        constructor: toConstructor(result.Constructor),
        grid: Number(result.grid),
        position: /^\d+$/.test(result.positionText) ? Number(result.positionText) : null,
        positionText: result.positionText,
        status: result.status,
        points: Number(result.points) + (sprintPoints.get(`${race.round}/${result.Driver.driverId}`) ?? 0),
      }))
      return {
        round: Number(race.round),
        name: race.raceName,
        entries,
        points: entries.reduce((sum, entry) => sum + entry.points, 0),
      }
    })
    .sort((a, b) => a.round - b.round)
}

function toStanding(standing: { position?: string, points: string } | undefined, final: boolean): SeasonStanding | null {
  // Pas de position pour un pilote exclu du championnat (Schumacher en 1997)
  const position = Number(standing?.position)
  if (!standing || !Number.isFinite(position))
    return null
  return { position, points: Number(standing.points), final }
}

/** Une saison passée est terminée ; la saison en cours l'est après sa dernière manche. */
async function seasonContext(event: H3Event, season: string) {
  const schedule = await getSchedule(event)
  const past = season !== schedule.season
  return { past, isOver: (round: string) => past || Number(round) >= schedule.races.length }
}

// --- Pilotes ---

/**
 * Place de chaque pilote au championnat d'une saison passée. Un seul cache par saison,
 * partagé par toutes les fiches : la première fiche d'un pilote coûte un appel par
 * saison disputée, les suivantes en réutilisent la plupart.
 */
const getPastDriverPositions = defineCachedFunction(async (_event: H3Event, season: string): Promise<Record<string, number>> => {
  const pages = await jolpicaPages<RawStandingsTable<RawDriverStandingsList>>(`${season}/driverstandings`)
  const positions: Record<string, number> = {}
  for (const standing of pages.flatMap(page => page.StandingsTable.StandingsLists[0]?.DriverStandings ?? [])) {
    if (standing.position)
      positions[standing.Driver.driverId] = Number(standing.position)
  }
  return positions
}, {
  group: CACHE_GROUP,
  name: 'driver-positions',
  getKey: (_event: H3Event, season: string) => season,
  maxAge: 30 * DAY,
  swr: true,
})

/** Place d'un pilote au championnat ; la saison en cours vient du classement déjà en cache. */
async function driverPosition(event: H3Event, id: string, season: string, currentSeason: string) {
  if (season !== currentSeason)
    return (await getPastDriverPositions(event, season))[id] ?? null
  const standings = await getStandings(event)
  return standings.drivers.items.find(item => item.driver.id === id)?.position ?? null
}

async function fetchDriverCareer(event: H3Event, id: string): Promise<DriverCareer | null> {
  const [info, races, champions, schedule] = await Promise.all([
    jolpica<{ DriverTable: { Drivers: RawDriver[] } }>(`drivers/${id}`),
    jolpicaRaces(`drivers/${id}/results`),
    getChampions(event),
    getSchedule(event),
  ])
  const raw = info.DriverTable.Drivers[0]
  if (!raw)
    return null

  const bySeason = new Map<string, RawRace[]>()
  for (const race of races)
    bySeason.set(race.season, [...bySeason.get(race.season) ?? [], race])

  const seasons = await Promise.all([...bySeason].map(async ([season, seasonRaces]): Promise<DriverSeasonSummary> => {
    const results = seasonRaces.flatMap(race => race.Results ?? [])
    const constructors = new Map(results.map(r => [r.Constructor.constructorId, toConstructor(r.Constructor)]))
    const finishes = results.filter(r => /^\d+$/.test(r.positionText)).map(r => Number(r.positionText))
    return {
      season,
      ...countStats(seasonRaces),
      constructors: [...constructors.values()],
      bestFinish: finishes.length ? Math.min(...finishes) : null,
      standing: await driverPosition(event, id, season, schedule.season),
      champion: champions.drivers[season] === id,
    }
  }))

  const driver = toDriver(raw)
  return {
    driver: { ...driver, dateOfBirth: raw.dateOfBirth ?? '', url: httpsUrl(raw.url), photo: await getDriverHeadshot(event, driver) },
    stats: countStats(races),
    titles: titlesOf(champions.drivers, id),
    seasons: seasons.sort((a, b) => b.season.localeCompare(a.season)),
  }
}

export const getDriverCareer = defineCachedFunction(fetchDriverCareer, {
  group: CACHE_GROUP,
  name: 'driver-career',
  getKey: (_event: H3Event, id: string) => id,
  maxAge: 6 * 60 * 60,
  swr: true,
  validate: freshWithin(DAY * 1000),
})

async function fetchDriverSeason(event: H3Event, id: string, season: string): Promise<DriverSeason | null> {
  const [races, sprints, standings, champions, context] = await Promise.all([
    jolpicaRaces(`${season}/drivers/${id}/results`),
    Number(season) >= FIRST_SPRINT_SEASON ? jolpicaRaces(`${season}/drivers/${id}/sprint`) : [],
    jolpica<RawStandingsTable<RawDriverStandingsList>>(`${season}/drivers/${id}/driverstandings`),
    getChampions(event),
    seasonContext(event, season),
  ])
  if (!races.length)
    return null

  const { round, StandingsLists } = standings.StandingsTable
  return {
    season,
    standing: toStanding(StandingsLists[0]?.DriverStandings[0], context.isOver(round)),
    stats: countStats(races),
    champion: champions.drivers[season] === id,
    rounds: toRounds(races, sprints),
  }
}

// --- Écuries ---

async function fetchConstructorCareer(event: H3Event, id: string): Promise<ConstructorCareer | null> {
  const base = `constructors/${id}`
  // Une écurie compte des milliers de résultats (2 300 pour Ferrari) : on lit les compteurs
  const [info, races, wins, seconds, thirds, poles, fastestLaps, seasons, champions] = await Promise.all([
    jolpica<{ ConstructorTable: { Constructors: RawConstructor[] } }>(base),
    jolpicaCount(`${base}/races`),
    jolpicaCount(`${base}/results/1`),
    jolpicaCount(`${base}/results/2`),
    jolpicaCount(`${base}/results/3`),
    jolpicaCount(`${base}/grid/1/results`),
    jolpicaCount(`${base}/fastest/1/results`),
    jolpica<{ SeasonTable: { Seasons: { season: string }[] } }>(`${base}/seasons`),
    getChampions(event),
  ])
  const raw = info.ConstructorTable.Constructors[0]
  if (!raw)
    return null

  return {
    constructor: { ...toConstructor(raw), url: httpsUrl(raw.url) },
    stats: { races, wins, podiums: wins + seconds + thirds, poles, fastestLaps },
    titles: titlesOf(champions.constructors, id),
    seasons: seasons.SeasonTable.Seasons.map(s => s.season).sort().reverse(),
  }
}

export const getConstructorCareer = defineCachedFunction(fetchConstructorCareer, {
  group: CACHE_GROUP,
  name: 'constructor-career',
  getKey: (_event: H3Event, id: string) => id,
  maxAge: 6 * 60 * 60,
  swr: true,
  validate: freshWithin(DAY * 1000),
})

async function fetchConstructorSeason(event: H3Event, id: string, season: string): Promise<ConstructorSeason | null> {
  const [races, sprints, standings, champions, context] = await Promise.all([
    jolpicaRaces(`${season}/constructors/${id}/results`),
    Number(season) >= FIRST_SPRINT_SEASON ? jolpicaRaces(`${season}/constructors/${id}/sprint`) : [],
    jolpica<RawStandingsTable<RawConstructorStandingsList>>(`${season}/constructors/${id}/constructorstandings`),
    getChampions(event),
    seasonContext(event, season),
  ])
  if (!races.length)
    return null

  const rounds = toRounds(races, sprints)
  const drivers = new Map<string, ConstructorSeason['drivers'][number]>()
  for (const entry of rounds.flatMap(r => r.entries)) {
    const known = drivers.get(entry.driver.id) ?? { driver: entry.driver, races: 0, points: 0 }
    drivers.set(entry.driver.id, { ...known, races: known.races + 1, points: known.points + entry.points })
  }

  const { round, StandingsLists } = standings.StandingsTable
  return {
    season,
    standing: toStanding(StandingsLists[0]?.ConstructorStandings[0], context.isOver(round)),
    stats: countStats(races),
    champion: champions.constructors[season] === id,
    drivers: [...drivers.values()].sort((a, b) => b.points - a.points || b.races - a.races),
    rounds,
  }
}

// --- Saisons : figées une fois passées, rafraîchies comme le classement sinon ---

const getLiveDriverSeason = defineCachedFunction(fetchDriverSeason, {
  group: CACHE_GROUP,
  name: 'driver-season',
  getKey: (_event: H3Event, id: string, season: string) => `${id}/${season}`,
  maxAge: 60 * 10,
  swr: true,
  validate: freshWithin(MAX_STALE),
})

const getPastDriverSeason = defineCachedFunction(fetchDriverSeason, {
  group: CACHE_GROUP,
  name: 'driver-season-past',
  getKey: (_event: H3Event, id: string, season: string) => `${id}/${season}`,
  maxAge: 30 * DAY,
  swr: true,
})

const getLiveConstructorSeason = defineCachedFunction(fetchConstructorSeason, {
  group: CACHE_GROUP,
  name: 'constructor-season',
  getKey: (_event: H3Event, id: string, season: string) => `${id}/${season}`,
  maxAge: 60 * 10,
  swr: true,
  validate: freshWithin(MAX_STALE),
})

const getPastConstructorSeason = defineCachedFunction(fetchConstructorSeason, {
  group: CACHE_GROUP,
  name: 'constructor-season-past',
  getKey: (_event: H3Event, id: string, season: string) => `${id}/${season}`,
  maxAge: 30 * DAY,
  swr: true,
})

export async function getDriverSeason(event: H3Event, id: string, season: string) {
  const { past } = await seasonContext(event, season)
  return past ? getPastDriverSeason(event, id, season) : getLiveDriverSeason(event, id, season)
}

export async function getConstructorSeason(event: H3Event, id: string, season: string) {
  const { past } = await seasonContext(event, season)
  return past ? getPastConstructorSeason(event, id, season) : getLiveConstructorSeason(event, id, season)
}
