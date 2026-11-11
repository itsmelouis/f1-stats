export default defineEventHandler(async (event) => {
  const season = await getDriverSeason(event, getJolpicaId(event), getSeasonParam(event))
  if (!season)
    throw createError({ statusCode: 404, message: 'Aucune course pour ce pilote cette saison' })
  return season
})
