export default defineEventHandler(async (event) => {
  const { season } = getQuery(event)
  if (season === undefined)
    return getStandings(event)

  const current = (await getSchedule(event)).season
  if (typeof season !== 'string' || !/^\d{4}$/.test(season) || season < '1950' || season > current)
    throw createError({ statusCode: 400, message: 'Saison invalide' })
  return getStandings(event, season === current ? undefined : season)
})
