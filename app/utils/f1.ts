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
  // Grands Prix disparus, pour les fiches pilote et écurie
  '70th Anniversary Grand Prix': 'Grand Prix du 70e anniversaire',
  'Argentine Grand Prix': 'Grand Prix d\'Argentine',
  'Caesars Palace Grand Prix': 'Grand Prix de Caesars Palace',
  'Dallas Grand Prix': 'Grand Prix de Dallas',
  'Detroit Grand Prix': 'Grand Prix de Détroit',
  'Eifel Grand Prix': 'Grand Prix de l\'Eifel',
  'European Grand Prix': 'Grand Prix d\'Europe',
  'French Grand Prix': 'Grand Prix de France',
  'German Grand Prix': 'Grand Prix d\'Allemagne',
  'Indian Grand Prix': 'Grand Prix d\'Inde',
  'Indianapolis 500': '500 miles d\'Indianapolis',
  'Korean Grand Prix': 'Grand Prix de Corée',
  'Luxembourg Grand Prix': 'Grand Prix du Luxembourg',
  'Malaysian Grand Prix': 'Grand Prix de Malaisie',
  'Mexican Grand Prix': 'Grand Prix du Mexique',
  'Moroccan Grand Prix': 'Grand Prix du Maroc',
  'Pacific Grand Prix': 'Grand Prix du Pacifique',
  'Pescara Grand Prix': 'Grand Prix de Pescara',
  'Portuguese Grand Prix': 'Grand Prix du Portugal',
  'Russian Grand Prix': 'Grand Prix de Russie',
  'Sakhir Grand Prix': 'Grand Prix de Sakhir',
  'San Marino Grand Prix': 'Grand Prix de Saint-Marin',
  'South African Grand Prix': 'Grand Prix d\'Afrique du Sud',
  'Styrian Grand Prix': 'Grand Prix de Styrie',
  'Swedish Grand Prix': 'Grand Prix de Suède',
  'Swiss Grand Prix': 'Grand Prix de Suisse',
  'Turkish Grand Prix': 'Grand Prix de Turquie',
  'Tuscan Grand Prix': 'Grand Prix de Toscane',
  'United States Grand Prix West': 'Grand Prix des États-Unis Ouest',
}

/** Pays d'origine d'après la nationalité Jolpica (« British »), pour éviter d'accorder l'adjectif. */
const NATIONALITY_COUNTRIES_FR: Record<string, string> = {
  'American': 'États-Unis',
  'Argentine': 'Argentine',
  'Argentinian': 'Argentine',
  'Australian': 'Australie',
  'Austrian': 'Autriche',
  'Belgian': 'Belgique',
  'Brazilian': 'Brésil',
  'British': 'Royaume-Uni',
  'Canadian': 'Canada',
  'Chilean': 'Chili',
  'Chinese': 'Chine',
  'Colombian': 'Colombie',
  'Czech': 'Tchéquie',
  'Danish': 'Danemark',
  'Dutch': 'Pays-Bas',
  'East German': 'Allemagne de l\'Est',
  'Finnish': 'Finlande',
  'French': 'France',
  'German': 'Allemagne',
  'Hong Kong': 'Hong Kong',
  'Hungarian': 'Hongrie',
  'Indian': 'Inde',
  'Indonesian': 'Indonésie',
  'Irish': 'Irlande',
  'Italian': 'Italie',
  'Japanese': 'Japon',
  'Liechtensteiner': 'Liechtenstein',
  'Malaysian': 'Malaisie',
  'Mexican': 'Mexique',
  'Monegasque': 'Monaco',
  'New Zealander': 'Nouvelle-Zélande',
  'Polish': 'Pologne',
  'Portuguese': 'Portugal',
  'Rhodesian': 'Rhodésie',
  'Russian': 'Russie',
  'South African': 'Afrique du Sud',
  'Spanish': 'Espagne',
  'Swedish': 'Suède',
  'Swiss': 'Suisse',
  'Thai': 'Thaïlande',
  'Uruguayan': 'Uruguay',
  'Venezuelan': 'Venezuela',
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

export function nationalityCountry(nationality: string) {
  return NATIONALITY_COUNTRIES_FR[nationality] ?? nationality
}

export function raceName(name: string) {
  return RACE_NAMES_FR[name] ?? name
}

/**
 * Dossiers des logos officiels sur formula1.com, pour les écuries de la grille 2026.
 * Les écuries disparues n'en ont pas et gardent leur barre de couleur.
 */
const TEAM_LOGO_SLUGS: Record<string, string> = {
  alpine: 'alpine',
  aston_martin: 'astonmartin',
  audi: 'audi',
  cadillac: 'cadillac',
  ferrari: 'ferrari',
  haas: 'haasf1team',
  mclaren: 'mclaren',
  mercedes: 'mercedes',
  rb: 'racingbulls',
  red_bull: 'redbullracing',
  williams: 'williams',
}

/** Logo officiel monochrome (noir pour le thème clair, blanc pour le sombre), `null` si inconnu. */
export function teamLogo(constructorId: string, variant: 'black' | 'white') {
  const slug = TEAM_LOGO_SLUGS[constructorId]
  if (!slug)
    return null
  return `https://media.formula1.com/image/upload/c_lfill,w_128/q_auto/v1740000001/common/f1/2026/${slug}/2026${slug}logo${variant}.webp`
}

export function teamColor(constructorId: string) {
  return TEAM_COLORS[constructorId] ?? '#71717A'
}

/** Lien Google Maps pointant sur les coordonnées GPS du circuit. */
export function circuitMapsUrl(circuit: Circuit) {
  return `https://www.google.com/maps/search/?api=1&query=${circuit.lat},${circuit.lng}`
}
