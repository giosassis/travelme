import { ShoppingBag, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'
import type { ShoppingItem } from '@/types'
import { formatCurrency } from '@/utils/format'

const PRIORITY_COLORS: Record<ShoppingItem['priority'], string> = {
  Alta: 'text-danger bg-red-50',
  Média: 'text-yellow-600 bg-yellow-50',
  Baixa: 'text-success bg-green-50',
}

const PRIORITY_DOTS: Record<ShoppingItem['priority'], string> = {
  Alta: '🔴',
  Média: '🟡',
  Baixa: '🟢',
}

interface Props {
  item: ShoppingItem
  onToggle: (id: string) => void
  onEdit: (item: ShoppingItem) => void
  onDelete: (id: string) => void
}

export function ShoppingItemRow({ item, onToggle, onEdit, onDelete }: Props) {
  const hasActual = item.bought && item.actualPrice > 0
  const hasEstimated = item.estimatedPrice > 0

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors ${
        item.bought ? 'bg-gray-50 opacity-70' : 'bg-white'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id)}
        aria-label={item.bought ? 'Desmarcar como comprado' : 'Marcar como comprado'}
        className="shrink-0 mt-0.5"
      >
        {item.bought ? (
          <CheckCircle2 size={20} className="text-success" />
        ) : (
          <Circle size={20} className="text-gray-300" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${item.bought ? 'line-through text-muted' : 'text-app-text'}`}>
            {item.name}
          </span>
          {item.quantity > 1 && (
            <span className="text-xs text-muted">× {item.quantity}</span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[item.priority]}`}>
            {PRIORITY_DOTS[item.priority]} {item.priority}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-muted">{item.category}</span>
          {hasActual ? (
            <span className="text-xs font-medium text-success">
              {formatCurrency(item.actualPrice * item.quantity)}
            </span>
          ) : hasEstimated ? (
            <span className="text-xs text-muted">
              ~{formatCurrency(item.estimatedPrice * item.quantity)}
            </span>
          ) : null}
        </div>
        {item.notes && (
          <p className="text-xs text-muted mt-0.5 truncate">{item.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(item)}
          aria-label="Editar"
          className="p-1.5 text-muted hover:text-primary transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          aria-label="Excluir"
          className="p-1.5 text-muted hover:text-danger transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Empty icon export for EmptyState ─────────────────────────────────────────
export { ShoppingBag as ShoppingEmptyIcon }
