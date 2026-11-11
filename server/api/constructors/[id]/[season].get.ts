export default defineEventHandler(async (event) => {
  const season = await getConstructorSeason(event, getJolpicaId(event), getSeasonParam(event))
  if (!season)
    throw createError({ statusCode: 404, message: 'Aucune course pour cette écurie cette saison' })
  return season
})
