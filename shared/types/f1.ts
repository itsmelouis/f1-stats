export type SessionKey
  = | 'fp1'
    | 'fp2'
    | 'fp3'
    | 'sprintQualifying'
    | 'sprint'
    | 'qualifying'
    | 'race'

export interface Session {
  key: SessionKey
  label: string
  /** ISO 8601, UTC */
  at: string
  /** `false` quand l'API ne fournit qu'une date sans heure */
  hasTime: boolean
}

export interface Circuit {
  id: string
  name: string
  locality: string
  country: string
  url: string
  lat: number
  lng: number
}

export interface Race {
  season: string
  round: number
  name: string
  url: string
  circuit: Circuit
  /** Départ de la course, ISO 8601 UTC */
  at: string
  hasSprint: boolean
  sessions: Session[]
}

export interface Schedule {
  season: string
  races: Race[]
}

export interface Driver {
  id: string
  code: string
  number: string
  firstName: string
  lastName: string
  nationality: string
}

export interface Constructor {
  id: string
  name: string
  nationality: string
}

export interface DriverStanding {
  /** `null` pour un pilote non classé (saisons anciennes) */
  position: number | null
  points: number
  wins: number
  /** Podiums en Grand Prix (sprints exclus) */
  podiums: number
  driver: Driver
  constructor: Constructor
}

export interface ConstructorStanding {
  position: number | null
  points: number
  wins: number
  /** Podiums en Grand Prix (sprints exclus), toutes voitures confondues */
  podiums: number
  constructor: Constructor
}

export interface Standings<T> {
  season: string
  /** Nombre de manches prises en compte */
  round: number
  items: T[]
}

export interface SeasonStandings {
  drivers: Standings<DriverStanding>
  constructors: Standings<ConstructorStanding>
}

export interface FastestLap {
  rank: number
  lap: number
  time: string
}

export interface SessionResult {
  position: number | null
  positionText: string
  points: number
  driver: Driver
  constructor: Constructor
  grid: number
  laps: number
  status: string
  /** Temps total pour le vainqueur, écart pour les autres, `null` si non classé */
  time: string | null
  fastestLap: FastestLap | null
}

export interface QualifyingResult {
  position: number
  driver: Driver
  constructor: Constructor
  q1: string | null
  q2: string | null
  q3: string | null
}

/** Une ligne du vote des fans « Pilote du jour » (formula1.com) */
export interface DriverOfTheDayVote {
  driver: Driver
  constructor: Constructor
  /** Part des votes, en pourcentage */
  percentage: number
}

/** Manche voisine dans le calendrier, pour la navigation précédente / suivante */
export type RaceLink = Pick<Race, 'round' | 'name'>

/** Tracé du circuit projeté en chemin SVG, prêt à dessiner */
export interface CircuitMap {
  viewBox: string
  /** Attribut `d` d'un `<path>` */
  path: string
  /** Ligne de départ / arrivée, dans le repère du viewBox */
  start: { x: number, y: number }
  /** Longueur du tracé en mètres, si connue */
  length: number | null
  /** Page source des données, pour l'attribution */
  sourceUrl: string
}

export interface RaceDetail {
  race: Race
  previous: RaceLink | null
  next: RaceLink | null
  circuitMap: CircuitMap | null
  results: SessionResult[] | null
  sprint: SessionResult[] | null
  qualifying: QualifyingResult[] | null
  /** Top du vote « Pilote du jour », `null` tant que le vote n'est pas publié */
  driverOfTheDay: DriverOfTheDayVote[] | null
}

// --- Fiches pilote et écurie ---

export interface DriverProfile extends Driver {
  /** AAAA-MM-JJ */
  dateOfBirth: string
  /** Page Wikipédia (anglais) */
  url: string
}

export interface ConstructorProfile extends Constructor {
  /** Page Wikipédia (anglais) */
  url: string
}

/** Compteurs en Grand Prix (sprints exclus), sur une carrière ou une saison */
export interface RaceStats {
  races: number
  wins: number
  /** Podiums ; pour une écurie, toutes voitures confondues */
  podiums: number
  /** Départs en pole (1er sur la grille), au plus près des poles officielles */
  poles: number
  fastestLaps: number
}

/** Classement d'une saison ; `final` est faux tant que la saison n'est pas terminée */
export interface SeasonStanding {
  position: number
  points: number
  final: boolean
}

/** Une saison dans le tableau de carrière d'un pilote */
export interface DriverSeasonSummary extends RaceStats {
  season: string
  constructors: Constructor[]
  /** Meilleure arrivée en Grand Prix, `null` s'il n'a jamais été classé */
  bestFinish: number | null
  /** Place au championnat (provisoire pour la saison en cours), `null` si non classé */
  standing: number | null
  champion: boolean
}

export interface DriverCareer {
  driver: DriverProfile
  stats: RaceStats
  /** Saisons titrées */
  titles: string[]
  /** De la plus récente à la plus ancienne */
  seasons: DriverSeasonSummary[]
}

/** Résultat d'un pilote sur un Grand Prix */
export interface RoundEntry {
  driver: Driver
  constructor: Constructor
  grid: number
  position: number | null
  positionText: string
  status: string
  /** Points du Grand Prix et du sprint du même week-end */
  points: number
}

export interface SeasonRound {
  round: number
  name: string
  /** Une ligne par voiture (plusieurs pour une écurie) */
  entries: RoundEntry[]
  /** Points du week-end (Grand Prix et sprint) */
  points: number
}

export interface DriverSeason {
  season: string
  standing: SeasonStanding | null
  stats: RaceStats
  champion: boolean
  rounds: SeasonRound[]
}

export interface ConstructorCareer {
  constructor: ConstructorProfile
  stats: RaceStats
  /** Titres constructeurs (décernés depuis 1958) */
  titles: string[]
  /** De la plus récente à la plus ancienne */
  seasons: string[]
}

export interface ConstructorSeason {
  season: string
  /** `null` avant 1958 (pas de championnat constructeurs) */
  standing: SeasonStanding | null
  stats: RaceStats
  champion: boolean
  drivers: { driver: Driver, races: number, points: number }[]
  rounds: SeasonRound[]
}
