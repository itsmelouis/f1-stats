import type { SessionResult } from '#shared/types/f1'

/** Toutes les heures sont affichées en heure de Paris, côté serveur comme côté client. */
export const TIME_ZONE = 'Europe/Paris'

export function formatDate(iso: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: TIME_ZONE, ...options }).format(new Date(iso))
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export function formatWeekday(iso: string) {
  return formatDate(iso, { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Nombre de jours (calendaires, heure de Paris) entre `now` et `iso`. */
export function daysUntil(iso: string, now: string) {
  const toDayIndex = (value: string) => {
    // en-CA donne un format AAAA-MM-JJ stable
    const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date(value))
      .split('-')
      .map(Number) as [number, number, number]
    return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
  }
  return toDayIndex(iso) - toDayIndex(now)
}

export function formatPoints(points: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(points)
}

const STATUS_LABELS: Record<string, string> = {
  'Retired': 'Abandon',
  'Disqualified': 'Disqualifié',
  'Withdrew': 'Forfait',
  'Did not qualify': 'Non qualifié',
  'Did not prequalify': 'Non préqualifié',
  'Did not start': 'Non partant',
  'Not classified': 'Non classé',
  'Accident': 'Accident',
  'Collision': 'Collision',
  'Collision damage': 'Dégâts (collision)',
  'Spun off': 'Sortie de piste',
  'Engine': 'Moteur',
  'Power Unit': 'Groupe propulseur',
  'Gearbox': 'Boîte de vitesses',
  'Transmission': 'Transmission',
  'Hydraulics': 'Hydraulique',
  'Electrical': 'Électrique',
  'Electronics': 'Électronique',
  'Brakes': 'Freins',
  'Suspension': 'Suspension',
  'Puncture': 'Crevaison',
  'Wheel': 'Roue',
  'Tyre': 'Pneu',
  'Overheating': 'Surchauffe',
  'Oil leak': 'Fuite d\'huile',
  'Water leak': 'Fuite d\'eau',
  'Fuel pressure': 'Pression d\'essence',
  'Out of fuel': 'Panne d\'essence',
  'Mechanical': 'Mécanique',
  'Illness': 'Maladie',
  'Injury': 'Blessure',
}

function lapsLabel(laps: number) {
  return `+${laps} tour${laps > 1 ? 's' : ''}`
}

/**
 * Colonne « Temps / Écart » : temps total pour le vainqueur, écart pour les
 * pilotes classés dans le même tour, nombre de tours de retard sinon, et
 * raison de l'abandon pour les non classés.
 */
export function resultTimeLabel(result: SessionResult, winner: SessionResult | undefined) {
  const lappedMatch = result.status.match(/^\+(\d+) Laps?$/)
  if (lappedMatch)
    return lapsLabel(Number(lappedMatch[1]))

  if (result.status === 'Finished')
    return result.time ?? '—'

  if (result.status === 'Lapped') {
    const behind = winner ? winner.laps - result.laps : 0
    return behind > 0 ? lapsLabel(behind) : (result.time ?? '—')
  }

  return STATUS_LABELS[result.status] ?? result.status
}

export function isClassified(result: SessionResult) {
  return result.position !== null && /^\d+$/.test(result.positionText)
}
