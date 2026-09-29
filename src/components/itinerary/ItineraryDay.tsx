import { Plus } from 'lucide-react'
import type { ItineraryItem } from '@/types'
import { formatDateLong } from '@/utils/format'
import { ActivityCard } from './ActivityCard'

interface Props {
  date: string
  items: ItineraryItem[]
  onAdd: (date: string) => void
  onEdit: (item: ItineraryItem) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export function ItineraryDay({ date, items, onAdd, onEdit, onDelete, onToggle }: Props) {
  const dateLabel = formatDateLong(date)
  const doneCount = items.filter((i) => i.status === 'Concluído').length

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-app-text capitalize">{dateLabel}</h3>
          {doneCount > 0 && (
            <p className="text-xs text-muted">
              {doneCount} de {items.length} concluída{items.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => onAdd(date)}
          aria-label={`Adicionar atividade em ${dateLabel}`}
          className="flex items-center gap-1 text-xs text-primary font-medium"
        >
          <Plus size={14} />
          Adicionar
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ActivityCard
            key={item.id}
            item={item}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item.id)}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
