import type { H3Event } from 'h3'

/** Identifiant Jolpica (`max_verstappen`, `cooper-climax`…), validé avant d'entrer dans une URL */
export function getJolpicaId(event: H3Event) {
  const id = getRouterParam(event, 'id') ?? ''
  if (!/^[\w-]+$/.test(id))
    throw createError({ statusCode: 400, message: 'Identifiant invalide' })
  return id
}

/** Saison du championnat (depuis 1950) */
export function getSeasonParam(event: H3Event) {
  const season = getRouterParam(event, 'season') ?? ''
  if (!/^\d{4}$/.test(season) || Number(season) < 1950)
    throw createError({ statusCode: 400, message: 'Saison invalide' })
  return season
}
