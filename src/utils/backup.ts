import type { TripBackup } from '@/types'

export function exportTripData(backup: TripBackup): void {
  const slug = backup.trip.destination
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  const filename = `travelme-${slug}-${backup.exportedAt.slice(0, 10)}.json`
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export type BackupValidationResult =
  | { ok: true; data: TripBackup }
  | { ok: false; error: string }

export function validateTripBackup(raw: unknown): BackupValidationResult {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'Arquivo inválido: o conteúdo não é um objeto JSON.' }
  }
  const obj = raw as Record<string, unknown>
  if (typeof obj.version !== 'number') {
    return { ok: false, error: 'Arquivo inválido: campo "version" ausente ou inválido.' }
  }
  if (typeof obj.trip !== 'object' || obj.trip === null) {
    return { ok: false, error: 'Arquivo inválido: campo "trip" ausente.' }
  }
  const trip = obj.trip as Record<string, unknown>
  if (!trip.id || !trip.name || !trip.destination) {
    return { ok: false, error: 'Arquivo inválido: viagem sem id, nome ou destino.' }
  }
  if (
    !Array.isArray(obj.expenses) ||
    !Array.isArray(obj.itinerary) ||
    !Array.isArray(obj.checklist) ||
    !Array.isArray(obj.reservations) ||
    !Array.isArray(obj.notes)
  ) {
    return { ok: false, error: 'Arquivo inválido: dados de viagem incompletos.' }
  }
  return { ok: true, data: raw as TripBackup }
}

export async function importTripData(file: File): Promise<BackupValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        resolve(validateTripBackup(parsed))
      } catch {
        resolve({ ok: false, error: 'Arquivo inválido: não foi possível ler o JSON.' })
      }
    }
    reader.onerror = () => resolve({ ok: false, error: 'Erro ao ler o arquivo.' })
    reader.readAsText(file)
  })
}
