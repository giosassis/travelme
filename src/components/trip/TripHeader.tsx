import { MapPin, Calendar, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Trip } from '@/types'
import { formatDate, daysBetween } from '@/utils/format'

interface Props {
  trip: Trip
}

export function TripHeader({ trip }: Props) {
  const navigate = useNavigate()
  const totalDays = daysBetween(trip.startDate, trip.endDate)

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-app-text">{trip.name}</h1>
          <div className="flex items-center gap-1 text-muted text-sm mt-1">
            <MapPin size={14} />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center gap-1 text-muted text-xs mt-1">
            <Calendar size={12} />
            <span>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)} · {totalDays} dia
              {totalDays !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          aria-label="Editar viagem"
          className="p-2 text-muted hover:text-primary transition-colors"
        >
          <Pencil size={16} />
        </button>
      </div>
    </div>
  )
}
