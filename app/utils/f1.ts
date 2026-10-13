import type { Circuit } from '#shared/types/f1'

const COUNTRY_NAMES_FR: Record<string, string> = {
  'Abu Dhabi': 'Abou Dabi',
  'Argentina': 'Argentine',
  'Australia': 'Australie',
  'Austria': 'Autriche',
  'Azerbaijan': 'Azerbaïdjan',
  'Bahrain': 'Bahreïn',
  'Belgium': 'Belgique',
  'Brazil': 'Brésil',
  'China': 'Chine',
  'Germany': 'Allemagne',
  'Hungary': 'Hongrie',
  'India': 'Inde',
  'Italy': 'Italie',
  'Japan': 'Japon',
  'Korea': 'Corée',
  'Malaysia': 'Malaisie',
  'Mexico': 'Mexique',
  'Netherlands': 'Pays-Bas',
  'Qatar': 'Qatar',
  'Russia': 'Russie',
  'Saudi Arabia': 'Arabie saoudite',
  'Singapore': 'Singapour',
  'South Africa': 'Afrique du Sud',
  'Spain': 'Espagne',
  'Turkey': 'Turquie',
  'UAE': 'Émirats arabes unis',
  'UK': 'Royaume-Uni',
  'USA': 'États-Unis',
}

const RACE_NAMES_FR: Record<string, string> = {
  'Australian Grand Prix': 'Grand Prix d\'Australie',
  'Chinese Grand Prix': 'Grand Prix de Chine',
  'Japanese Grand Prix': 'Grand Prix du Japon',
  'Bahrain Grand Prix': 'Grand Prix de Bahreïn',
  'Saudi Arabian Grand Prix': 'Grand Prix d\'Arabie saoudite',
  'Miami Grand Prix': 'Grand Prix de Miami',
  'Emilia Romagna Grand Prix': 'Grand Prix d\'Émilie-Romagne',
  'Monaco Grand Prix': 'Grand Prix de Monaco',
  'Canadian Grand Prix': 'Grand Prix du Canada',
  'Spanish Grand Prix': 'Grand Prix d\'Espagne',
  'Barcelona Grand Prix': 'Grand Prix de Barcelone',
  'Austrian Grand Prix': 'Grand Prix d\'Autriche',
  'British Grand Prix': 'Grand Prix de Grande-Bretagne',
  'Belgian Grand Prix': 'Grand Prix de Belgique',
  'Hungarian Grand Prix': 'Grand Prix de Hongrie',
  'Dutch Grand Prix': 'Grand Prix des Pays-Bas',
  'Italian Grand Prix': 'Grand Prix d\'Italie',
  'Azerbaijan Grand Prix': 'Grand Prix d\'Azerbaïdjan',
  'Singapore Grand Prix': 'Grand Prix de Singapour',
  'United States Grand Prix': 'Grand Prix des États-Unis',
  'Mexico City Grand Prix': 'Grand Prix de Mexico',
  'Brazilian Grand Prix': 'Grand Prix du Brésil',
  'São Paulo Grand Prix': 'Grand Prix de São Paulo',
  'Las Vegas Grand Prix': 'Grand Prix de Las Vegas',
  'Qatar Grand Prix': 'Grand Prix du Qatar',
  'Abu Dhabi Grand Prix': 'Grand Prix d\'Abou Dabi',
}

/** Couleurs d'écurie, purement décoratives (barre/pastille à côté du nom). */
const TEAM_COLORS: Record<string, string> = {
  mercedes: '#00A19B',
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  red_bull: '#3671C6',
  rb: '#6692FF',
  alpine: '#0093CC',
  aston_martin: '#229971',
  williams: '#1868DB',
  haas: '#9C9FA2',
  audi: '#C8102E',
  sauber: '#52E252',
  cadillac: '#1C1C1C',
}

export function countryName(country: string) {
  return COUNTRY_NAMES_FR[country] ?? country
}

export function raceName(name: string) {
  return RACE_NAMES_FR[name] ?? name
}

export function teamColor(constructorId: string) {
  return TEAM_COLORS[constructorId] ?? '#71717A'
}

/** Lien Google Maps pointant sur les coordonnées GPS du circuit. */
export function circuitMapsUrl(circuit: Circuit) {
  return `https://www.google.com/maps/search/?api=1&query=${circuit.lat},${circuit.lng}`
}
