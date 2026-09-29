import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import type { BudgetCategory, Expense, ExpenseCategory } from '@/types'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/lib/utils'

const ALL_CATEGORIES: ExpenseCategory[] = [
  'Transporte', 'Hospedagem', 'Alimentação', 'Passeios', 'Compras',
  'Farmácia', 'Higiene e beleza', 'Ingressos', 'Emergência', 'Outros',
]

interface Props {
  budgetCategories: BudgetCategory[]
  expenses: Expense[]
  onUpsert: (category: ExpenseCategory, amount: number) => Promise<void>
}

export function BudgetCategoryTable({ budgetCategories, expenses, onUpsert }: Props) {
  const [editing, setEditing] = useState<ExpenseCategory | null>(null)
  const [editValue, setEditValue] = useState('')

  const categoryMap = new Map(budgetCategories.map((c) => [c.category, c.plannedAmount]))

  const rows = ALL_CATEGORIES.map((cat) => {
    const planned = categoryMap.get(cat) ?? 0
    const realized = expenses
      .filter((e) => e.category === cat && e.status === 'Pago')
      .reduce((s, e) => s + e.amount, 0)
    const pending = expenses
      .filter((e) => e.category === cat && e.status === 'Pendente')
      .reduce((s, e) => s + e.amount, 0)
    const diff = planned - realized - pending
    return { cat, planned, realized, pending, diff }
  }).filter((r) => r.planned > 0 || r.realized > 0 || r.pending > 0)

  async function saveEdit(cat: ExpenseCategory) {
    const val = parseFloat(editValue.replace(',', '.'))
    if (!isNaN(val) && val >= 0) {
      await onUpsert(cat, val)
    }
    setEditing(null)
  }

  function startEdit(cat: ExpenseCategory, currentPlanned: number) {
    setEditing(cat)
    setEditValue(String(currentPlanned))
  }

  return (
    <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-app-text text-sm">Planejado × Realizado</h3>
        <p className="text-xs text-muted mt-0.5">Clique em ✏️ para definir o orçamento por categoria</p>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-muted">Nenhuma categoria com valores definidos ou gastos registrados.</p>
          <p className="text-xs text-muted mt-1">Clique em ✏️ ao lado de uma categoria para definir um orçamento.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {rows.map(({ cat, planned, realized, pending, diff }) => (
            <div key={cat} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-app-text">{cat}</span>
                <button
                  onClick={() => startEdit(cat, planned)}
                  aria-label={`Editar orçamento de ${cat}`}
                  className="p-1 text-muted hover:text-primary rounded"
                >
                  <Pencil size={12} />
                </button>
              </div>

              {editing === cat ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    min="0"
                    step="any"
                    autoFocus
                    placeholder="Planejado (R$)"
                    className="flex-1 border border-primary rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                  />
                  <button onClick={() => saveEdit(cat)} className="text-success"><Check size={16} /></button>
                  <button onClick={() => setEditing(null)} className="text-danger"><X size={16} /></button>
                </div>
              ) : null}

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted mb-0.5">Planejado</p>
                  <p className="font-medium text-app-text">{planned > 0 ? formatCurrency(planned) : '—'}</p>
                </div>
                <div>
                  <p className="text-muted mb-0.5">Realizado</p>
                  <p className="font-medium text-danger">{formatCurrency(realized)}</p>
                </div>
                <div>
                  <p className="text-muted mb-0.5">Diferença</p>
                  <p className={cn('font-medium', diff < 0 ? 'text-danger' : 'text-success')}>
                    {planned > 0 ? formatCurrency(diff) : '—'}
                  </p>
                </div>
              </div>

              {planned > 0 && (
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      realized + pending > planned ? 'bg-danger' : realized + pending >= planned * 0.8 ? 'bg-warning' : 'bg-primary',
                    )}
                    style={{ width: `${Math.min(((realized + pending) / planned) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add any category */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-muted mb-2">Definir orçamento para outra categoria:</p>
        <AddCategoryRow onAdd={onUpsert} existing={budgetCategories.map(c => c.category)} />
      </div>
    </div>
  )
}

function AddCategoryRow({
  onAdd,
  existing,
}: {
  onAdd: (cat: ExpenseCategory, amount: number) => Promise<void>
  existing: ExpenseCategory[]
}) {
  const [cat, setCat] = useState<ExpenseCategory>('Outros')
  const [amount, setAmount] = useState('')

  const available = ALL_CATEGORIES.filter((c) => !existing.includes(c))

  async function handle() {
    const val = parseFloat(amount.replace(',', '.'))
    if (isNaN(val) || val < 0) return
    await onAdd(cat, val)
    setAmount('')
  }

  if (available.length === 0) return null

  return (
    <div className="flex gap-2 items-center">
      <select
        value={cat}
        onChange={(e) => setCat(e.target.value as ExpenseCategory)}
        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white"
      >
        {available.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="R$"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="any"
        className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white"
      />
      <button
        onClick={handle}
        className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium"
      >
        Definir
      </button>
    </div>
  )
}
