import { Pencil, Trash2 } from 'lucide-react'
import type { Reservation } from '@/types'
import { formatDate, formatCurrency, formatDuration } from '@/utils/format'
import { LocationField } from '@/components/common/LocationField'
import { cn } from '@/lib/utils'

const TYPE_EMOJI: Record<string, string> = {
  Voo: '✈️',
  Hospedagem: '🏨',
  Passeio: '🗺️',
  Restaurante: '🍽️',
  Transporte: '🚗',
  Ingresso: '🎫',
  Outro: '📋',
}

const STATUS_STYLE: Record<string, string> = {
  Confirmado: 'bg-success/10 text-success',
  Pendente: 'bg-warning/20 text-warning',
  Cancelado: 'bg-danger/10 text-danger',
}

interface Props {
  reservation: Reservation
  onEdit: () => void
  onDelete: () => void
}

export function ReservationCard({ reservation, onEdit, onDelete }: Props) {
  const emoji = TYPE_EMOJI[reservation.type] ?? '📋'
  const statusStyle = STATUS_STYLE[reservation.status] ?? 'bg-gray-100 text-muted'
  const duration = formatDuration(reservation.startTime, reservation.endTime)

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-2xl leading-none shrink-0">{emoji}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-app-text">{reservation.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted">{formatDate(reservation.date)}</span>
              {reservation.startTime && (
                <span className="text-xs text-muted font-mono">
                  {reservation.startTime}
                  {reservation.endTime ? ` — ${reservation.endTime}` : ''}
                  {duration && ` (${duration})`}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} aria-label="Editar" className="p-1.5 text-muted hover:text-primary">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} aria-label="Excluir" className="p-1.5 text-muted hover:text-danger">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusStyle)}>
          {reservation.status}
        </span>
        {reservation.confirmationCode && (
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-muted font-mono">
            #{reservation.confirmationCode}
          </span>
        )}
        {reservation.cost > 0 && (
          <span className="text-xs font-medium text-app-text">{formatCurrency(reservation.cost)}</span>
        )}
      </div>

      {reservation.location && (
        <LocationField value={reservation.location} onChange={() => {}} readOnly />
      )}

      {reservation.notes && (
        <p className="text-xs text-muted mt-2">{reservation.notes}</p>
      )}
    </div>
  )
}
