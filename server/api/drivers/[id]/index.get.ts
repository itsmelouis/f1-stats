export default defineEventHandler(async (event) => {
  const career = await getDriverCareer(event, getJolpicaId(event))
  if (!career)
    throw createError({ statusCode: 404, message: 'Pilote introuvable' })
  return career
})
