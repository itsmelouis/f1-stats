import type { Circuit, CircuitMap } from '#shared/types/f1'

/**
 * Tracés des circuits : jeu de données GeoJSON libre (MIT, relevés OpenStreetMap)
 * https://github.com/bacinger/f1-circuits — apparié à Jolpica par coordonnées GPS,
 * puis projeté en chemin SVG côté serveur pour que le front n'ait qu'à le dessiner.
 */
const REPO_URL = 'https://github.com/bacinger/f1-circuits'
const RAW_URL = 'https://raw.githubusercontent.com/bacinger/f1-circuits/master'

/** Au-delà, on considère que le circuit n'est pas dans le jeu de données */
const MAX_DISTANCE_KM = 15
const VIEW_WIDTH = 800
const PADDING = 24

interface CircuitLocation {
  id: string
  name: string
  lat: number
  lon: number
}

interface CircuitFeatureCollection {
  features: {
    properties: { id: string, length?: number }
    geometry: { type: string, coordinates: [number, number][] }
  }[]
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** Projection équirectangulaire locale puis mise à l'échelle dans un viewBox de largeur fixe */
function toSvg(coordinates: [number, number][]) {
  const latMean = coordinates.reduce((sum, [, lat]) => sum + lat, 0) / coordinates.length
  const kx = Math.cos((latMean * Math.PI) / 180)
  const points = coordinates.map(([lng, lat]) => ({ x: lng * kx, y: -lat }))

  const minX = Math.min(...points.map(p => p.x))
  const maxX = Math.max(...points.map(p => p.x))
  const minY = Math.min(...points.map(p => p.y))
  const maxY = Math.max(...points.map(p => p.y))

  const scale = (VIEW_WIDTH - 2 * PADDING) / (maxX - minX)
  const height = Math.round((maxY - minY) * scale + 2 * PADDING)
  const project = (p: { x: number, y: number }) => ({
    x: Number(((p.x - minX) * scale + PADDING).toFixed(1)),
    y: Number(((p.y - minY) * scale + PADDING).toFixed(1)),
  })

  const projected = points.map(project)
  const path = `${projected.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join('')}Z`

  return { viewBox: `0 0 ${VIEW_WIDTH} ${height}`, path, start: projected[0]! }
}

// raw.githubusercontent.com sert du text/plain : on force le parsing JSON
function fetchJson<T>(path: string) {
  return $fetch<T>(`${RAW_URL}/${path}`, { responseType: 'json' })
}

const getLocations = defineCachedFunction(
  () => fetchJson<CircuitLocation[]>('f1-locations.json'),
  { group: 'circuits', name: 'locations', getKey: () => 'all', maxAge: 60 * 60 * 24 * 30, swr: true },
)

async function fetchCircuitMap(circuit: Circuit): Promise<CircuitMap | null> {
  const locations = await getLocations()
  const nearest = locations
    .map(location => ({ location, km: distanceKm(circuit.lat, circuit.lng, location.lat, location.lon) }))
    .sort((a, b) => a.km - b.km)[0]
  if (!nearest || nearest.km > MAX_DISTANCE_KM)
    return null

  const data = await fetchJson<CircuitFeatureCollection>(`circuits/${nearest.location.id}.geojson`)
  const feature = data.features.find(f => f.geometry.type === 'LineString')
  if (!feature || feature.geometry.coordinates.length < 3)
    return null

  return {
    ...toSvg(feature.geometry.coordinates),
    length: feature.properties.length ?? null,
    sourceUrl: `${REPO_URL}/blob/master/circuits/${nearest.location.id}.geojson`,
  }
}

export const getCircuitMap = defineCachedFunction(async (circuit: Circuit): Promise<CircuitMap | null> => {
  try {
    return await fetchCircuitMap(circuit)
  }
  catch {
    // Le tracé est un bonus : une erreur réseau ne doit pas casser la page
    return null
  }
}, {
  group: 'circuits',
  name: 'map',
  getKey: (circuit: Circuit) => circuit.id,
  maxAge: 60 * 60 * 24 * 30,
  swr: true,
})
