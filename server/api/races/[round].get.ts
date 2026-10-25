export default defineEventHandler(async (event) => {
  const round = Number(getRouterParam(event, 'round'))
  if (!Number.isInteger(round) || round < 1) {
    throw createError({ statusCode: 400, message: 'Numéro de manche invalide' })
  }

  const detail = await getRaceDetail(event, round)
  if (!detail) {
    throw createError({ statusCode: 404, message: 'Manche introuvable' })
  }

  return detail
})
