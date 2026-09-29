import { Pencil, Trash2 } from 'lucide-react'
import type { ChecklistItem } from '@/types'
import { formatWeight } from '@/utils/format'
import { cn } from '@/lib/utils'

interface Props {
  item: ChecklistItem
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ChecklistItemRow({ item, onToggle, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
      <button
        onClick={onToggle}
        aria-label={item.checked ? 'Desmarcar item' : 'Marcar item'}
        className={cn(
          'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
          item.checked ? 'bg-success border-success' : 'border-gray-300',
        )}
      >
        {item.checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm text-app-text', item.checked && 'line-through text-muted')}>
          {item.name}
          {item.quantity > 1 && (
            <span className="ml-1 text-xs text-muted">×{item.quantity}</span>
          )}
        </p>
        {item.notes && <p className="text-xs text-muted truncate">{item.notes}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {item.weight > 0 && (
          <span className="text-xs text-muted">{formatWeight(item.weight * item.quantity)}</span>
        )}
        <button onClick={onEdit} aria-label="Editar" className="p-1 text-muted hover:text-primary">
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} aria-label="Excluir" className="p-1 text-muted hover:text-danger">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
