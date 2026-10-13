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
  position: number
  points: number
  wins: number
  /** Podiums en Grand Prix (sprints exclus) */
  podiums: number
  driver: Driver
  constructor: Constructor
}

export interface ConstructorStanding {
  position: number
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
}
