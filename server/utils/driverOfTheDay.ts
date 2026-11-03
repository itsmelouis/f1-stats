import type { H3Event } from 'h3'
import type { DriverOfTheDayVote, Race, SessionResult } from '#shared/types/f1'

/**
 * Vote des fans « Pilote du jour » : ni Jolpica ni OpenF1 ne l'exposent. On lit le
 * relevé JSON de https://github.com/TracingInsights/DOTD (Apache 2.0), qui reprend
 * les pourcentages publiés par formula1.com après chaque Grand Prix.
 */
const RAW_URL = 'https://raw.githubusercontent.com/TracingInsights/DOTD/main'

/** Nombre de pilotes affichés */
const TOP = 3

interface RawSeason {
  year: number
  races: {
    race_name: string
    winner: string
    voting_results: { driver: string, percentage: number }[]
  }[]
}

/** « Bahrain Grand Prix in Malaysia » → « bahraininmalaysia » : minuscules ASCII, sans « grand prix » */
function normalize(name: string) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/grand prix/g, '')
    .replace(/[^a-z]/g, '')
}

// raw.githubusercontent.com sert du text/plain : on force le parsing JSON
const getSeason = defineCachedFunction(
  (_event: H3Event, season: string) => $fetch<RawSeason>(`${RAW_URL}/${season}/dotd_${season}.json`, { responseType: 'json' }),
  { group: 'dotd', name: 'season', getKey: (_event: H3Event, season: string) => season, maxAge: 60 * 60, swr: true },
)

/** Les noms diffèrent parfois entre les deux sources (« Barcelona » / « Barcelona-Catalunya ») : exact d'abord, puis inclusion */
function findRace(season: RawSeason, race: Race) {
  const wanted = normalize(race.name)
  const candidates = season.races.map(r => ({ r, key: normalize(r.race_name) }))
  return candidates.find(c => c.key === wanted)?.r
    ?? candidates.find(c => c.key.includes(wanted) || wanted.includes(c.key))?.r
    ?? null
}

/** Retrouve le pilote Jolpica par nom de famille, puis par nom complet (« Kimi Antonelli » / « Andrea Kimi Antonelli ») */
function findDriver(results: SessionResult[], name: string) {
  const wanted = normalize(name)
  const byLastName = results.filter(r => wanted.endsWith(normalize(r.driver.lastName)))
  if (byLastName.length === 1)
    return byLastName[0]!
  return byLastName.find(r => normalize(`${r.driver.firstName} ${r.driver.lastName}`).includes(wanted)) ?? null
}

export async function getDriverOfTheDay(event: H3Event, race: Race, results: SessionResult[]): Promise<DriverOfTheDayVote[] | null> {
  try {
    const entry = findRace(await getSeason(event, race.season), race)
    if (!entry)
      return null

    const votes = entry.voting_results
      .flatMap((vote) => {
        const result = findDriver(results, vote.driver)
        return result ? [{ driver: result.driver, constructor: result.constructor, percentage: vote.percentage }] : []
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, TOP)
    return votes.length ? votes : null
  }
  catch (error) {
    // Le vote est un bonus : une erreur ne doit pas casser la page
    console.error('[dotd]', error)
    return null
  }
}
