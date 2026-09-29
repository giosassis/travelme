import { Pencil, Trash2 } from 'lucide-react'
import type { Expense } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  Transporte: 'bg-blue-50 text-blue-700',
  Hospedagem: 'bg-purple-50 text-purple-700',
  Alimentação: 'bg-orange-50 text-orange-700',
  Passeios: 'bg-teal-light text-teal',
  Compras: 'bg-pink-50 text-pink-700',
  Farmácia: 'bg-red-50 text-red-700',
  'Higiene e beleza': 'bg-yellow-50 text-yellow-700',
  Ingressos: 'bg-indigo-50 text-indigo-700',
  Emergência: 'bg-danger/10 text-danger',
  Outros: 'bg-gray-100 text-muted',
}

interface Props {
  expense: Expense
  onEdit: () => void
  onDelete: () => void
}

export function ExpenseCard({ expense, onEdit, onDelete }: Props) {
  const colorClass = CATEGORY_COLORS[expense.category] ?? 'bg-gray-100 text-muted'
  const isPaid = expense.status === 'Pago'

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm text-app-text truncate">{expense.description}</p>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
              isPaid
                ? 'bg-success/10 text-success'
                : 'bg-warning/20 text-warning',
            )}
          >
            {expense.status}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-xs px-2 py-0.5 rounded-full', colorClass)}>
            {expense.category}
          </span>
          <span className="text-xs text-muted">{formatDate(expense.date)}</span>
          <span className="text-xs text-muted">{expense.paymentMethod}</span>
        </div>
        {expense.notes && (
          <p className="text-xs text-muted mt-1 truncate">{expense.notes}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className={cn('font-bold text-sm', isPaid ? 'text-danger' : 'text-warning')}>
          {formatCurrency(expense.amount)}
        </p>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            aria-label="Editar gasto"
            className="p-1.5 text-muted hover:text-primary rounded-lg transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            aria-label="Excluir gasto"
            className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
