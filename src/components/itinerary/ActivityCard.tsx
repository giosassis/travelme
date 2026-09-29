import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'
import type { ItineraryItem } from '@/types'
import { formatCurrency, formatDuration } from '@/utils/format'
import { LocationField } from '@/components/common/LocationField'
import { cn } from '@/lib/utils'

const CATEGORY_EMOJI: Record<string, string> = {
  Transporte: '🚗',
  Alimentação: '🍽️',
  Passeio: '🗺️',
  Praia: '🏖️',
  Compras: '🛍️',
  Descanso: '😴',
  Outro: '📍',
}

const STATUS_STYLE: Record<string, string> = {
  Planejado: 'bg-primary-light text-primary',
  Confirmado: 'bg-teal-light text-teal',
  Concluído: 'bg-success/10 text-success',
  Cancelado: 'bg-danger/10 text-danger',
}

interface Props {
  item: ItineraryItem
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}

export function ActivityCard({ item, onEdit, onDelete, onToggle }: Props) {
  const emoji = CATEGORY_EMOJI[item.category] ?? '📍'
  const statusStyle = STATUS_STYLE[item.status] ?? 'bg-gray-100 text-muted'
  const done = item.status === 'Concluído'
  const duration = formatDuration(item.startTime, item.endTime)

  return (
    <div className={cn('bg-surface rounded-2xl p-4 shadow-sm', done && 'opacity-70')}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          aria-label={done ? 'Desmarcar como concluída' : 'Marcar como concluída'}
          className="mt-0.5 shrink-0"
        >
          {done ? (
            <CheckCircle2 size={20} className="text-success" />
          ) : (
            <Circle size={20} className="text-muted" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {item.startTime && (
                <p className="text-xs text-muted font-mono mb-0.5">
                  {item.startTime}{item.endTime ? ` — ${item.endTime}` : ''}
                  {duration && <span className="ml-1 text-muted/60">({duration})</span>}
                </p>
              )}
              <p className={cn('font-semibold text-sm text-app-text', done && 'line-through')}>
                {emoji} {item.title}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={onEdit} aria-label="Editar" className="p-1.5 text-muted hover:text-primary rounded-lg">
                <Pencil size={14} />
              </button>
              <button onClick={onDelete} aria-label="Excluir" className="p-1.5 text-muted hover:text-danger rounded-lg">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {item.description && (
            <p className="text-xs text-muted mt-1 line-clamp-2">{item.description}</p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={cn('text-xs px-2 py-0.5 rounded-full', statusStyle)}>
              {item.status}
            </span>
            {item.estimatedCost > 0 && (
              <span className="text-xs text-muted">
                Estimado: {formatCurrency(item.estimatedCost)}
              </span>
            )}
            {item.actualCost > 0 && (
              <span className="text-xs text-danger font-medium">
                Real: {formatCurrency(item.actualCost)}
              </span>
            )}
          </div>

          {item.location && (
            <div className="mt-2">
              <LocationField value={item.location} onChange={() => {}} readOnly />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
