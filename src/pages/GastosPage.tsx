import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { DollarSign, Plus } from 'lucide-react'
import { useExpenses } from '@/hooks/useExpenses'
import { useBudgetCategories } from '@/hooks/useBudgetCategories'
import { useDashboard } from '@/hooks/useDashboard'
import { ExpenseCard } from '@/components/expense/ExpenseCard'
import { ExpenseForm } from '@/components/expense/ExpenseForm'
import { BudgetCategoryTable } from '@/components/expense/BudgetCategoryTable'
import { BudgetChart } from '@/components/expense/BudgetChart'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { BudgetCard } from '@/components/trip/BudgetCard'
import type { Expense } from '@/types'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/lib/utils'

export default function GastosPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { expenses, addExpense, updateExpense, deleteExpense, loading } = useExpenses(id)
  const { categories, upsertCategory } = useBudgetCategories(id)
  const { data: dashData } = useDashboard(id)

  const [tab, setTab] = useState<'lancamentos' | 'categorias'>('lancamentos')
  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function handleEdit(expense: Expense) {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    setEditingExpense(undefined)
  }

  async function handleSubmit(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data)
    } else {
      await addExpense(data)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    await deleteExpense(deletingId)
    setDeletingId(null)
  }

  if (!id) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-app-text">Gastos</h1>
        <button
          onClick={() => { setEditingExpense(undefined); setFormOpen(true) }}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {/* Summary */}
      {dashData && (
        <BudgetCard
          totalBudget={dashData.totalBudget}
          totalSpent={dashData.totalSpent}
          totalPending={dashData.totalPending}
          balance={dashData.balance}
          percentUsed={dashData.percentUsed}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {[
          { key: 'lancamentos', label: 'Lançamentos' },
          { key: 'categorias', label: 'Por categoria' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
              tab === t.key ? 'bg-surface text-primary shadow-sm' : 'text-muted',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'lancamentos' && (
        <div>
          {loading ? (
            <p className="text-center text-muted py-8 text-sm">Carregando...</p>
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Nenhum gasto registrado ainda"
              description="Comece adicionando seu primeiro gasto da viagem."
              action={{ label: '+ Adicionar gasto', onClick: () => setFormOpen(true) }}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {/* Totals */}
              <div className="grid grid-cols-2 gap-3 mb-1">
                <div className="bg-surface rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-muted mb-0.5">Total pago</p>
                  <p className="font-bold text-sm text-danger">
                    {formatCurrency(expenses.filter(e => e.status === 'Pago').reduce((s, e) => s + e.amount, 0))}
                  </p>
                </div>
                <div className="bg-surface rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-muted mb-0.5">Total pendente</p>
                  <p className="font-bold text-sm text-warning">
                    {formatCurrency(expenses.filter(e => e.status === 'Pendente').reduce((s, e) => s + e.amount, 0))}
                  </p>
                </div>
              </div>
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={() => handleEdit(expense)}
                  onDelete={() => setDeletingId(expense.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'categorias' && (
        <div>
          <BudgetCategoryTable
            budgetCategories={categories}
            expenses={expenses}
            onUpsert={upsertCategory}
          />
          <BudgetChart budgetCategories={categories} expenses={expenses} />
        </div>
      )}

      {id && (
        <ExpenseForm
          key={editingExpense?.id ?? 'novo'}
          open={formOpen}
          tripId={id}
          initialData={editingExpense}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        title="Excluir gasto"
        description="Este gasto será excluído permanentemente. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
