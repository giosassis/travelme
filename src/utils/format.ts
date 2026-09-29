const ptBR = 'pt-BR'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(ptBR, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat(ptBR, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function formatDateLong(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat(ptBR, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
}

export function formatDateShort(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat(ptBR, { day: '2-digit', month: 'short' }).format(date)
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return new Intl.NumberFormat(ptBR, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / total)
}

export function formatWeight(kg: number): string {
  return new Intl.NumberFormat(ptBR, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(kg) + ' kg'
}

export function formatDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return ''
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMin <= 0) return ''
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m}min`
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export function daysBetween(start: string, end: string): number {
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const s = new Date(sy, sm - 1, sd)
  const e = new Date(ey, em - 1, ed)
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000) + 1)
}
