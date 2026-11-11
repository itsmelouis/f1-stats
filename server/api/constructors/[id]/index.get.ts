export default defineEventHandler(async (event) => {
  const career = await getConstructorCareer(event, getJolpicaId(event))
  if (!career)
    throw createError({ statusCode: 404, message: 'Écurie introuvable' })
  return career
})
