import { MapPin, Calendar, DollarSign, Pencil, Trash2, CheckCircle2, Weight } from 'lucide-react'
import type { Trip } from '@/types'
import { formatDate, formatCurrency, daysUntil, daysBetween } from '@/utils/format'
import { cn } from '@/lib/utils'

interface Props {
  trip: Trip
  isActive: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TripCard({ trip, isActive, onSelect, onEdit, onDelete }: Props) {
  const days = daysUntil(trip.startDate)
  const totalDays = daysBetween(trip.startDate, trip.endDate)

  let statusText: string
  let statusClass: string
  if (days > 0) {
    statusText = `Em ${days} dia${days > 1 ? 's' : ''}`
    statusClass = 'bg-primary-light text-primary'
  } else if (days === 0) {
    statusText = 'Começa hoje!'
    statusClass = 'bg-warning/20 text-warning'
  } else {
    const endDays = daysUntil(trip.endDate)
    if (endDays < 0) {
      statusText = 'Concluída'
      statusClass = 'bg-gray-100 text-muted'
    } else {
      statusText = 'Em andamento'
      statusClass = 'bg-success/20 text-success'
    }
  }

  return (
    <div
      className={cn(
        'bg-surface rounded-2xl p-4 shadow-sm border-2 transition-all',
        isActive ? 'border-primary' : 'border-transparent',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <button onClick={onSelect} className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-app-text truncate">{trip.name}</h3>
            {isActive && <CheckCircle2 size={16} className="text-primary shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-muted text-xs mt-0.5">
            <MapPin size={12} />
            <span className="truncate">{trip.destination}</span>
          </div>
        </button>
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={onEdit}
            aria-label="Editar viagem"
            className="p-1.5 text-muted hover:text-primary rounded-lg transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            aria-label="Excluir viagem"
            className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <button onClick={onSelect} className="w-full text-left">
        <div className="flex items-center gap-3 text-xs text-muted mb-2">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
          </span>
          <span>·</span>
          <span>{totalDays} dia{totalDays !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted">
            <DollarSign size={12} />
            {formatCurrency(trip.budget)}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-muted">
              <Weight size={12} />
              {trip.luggageWeightLimit} kg
            </span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusClass)}>
              {statusText}
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}
