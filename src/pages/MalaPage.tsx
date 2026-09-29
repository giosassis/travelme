import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Luggage, Plus, Pencil, Sparkles } from 'lucide-react'
import { useChecklist } from '@/hooks/useChecklist'
import { useTripContext } from '@/contexts/TripContext'
import { ChecklistGroup } from '@/components/checklist/ChecklistGroup'
import { ChecklistItemForm } from '@/components/checklist/ChecklistItemForm'
import { SuggestedChecklistModal } from '@/components/checklist/SuggestedChecklistModal'
import { WeightBar } from '@/components/checklist/WeightBar'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import type { ChecklistItem, ChecklistCategory } from '@/types'
import { formatPercent } from '@/utils/format'
import { useTrips } from '@/hooks/useTrips'

const CATEGORY_ORDER: ChecklistCategory[] = [
  'Roupas', 'Higiene e beleza', 'Farmácia', 'Eletrônicos',
  'Documentos', 'Praia', 'Acessórios', 'Outros',
]

export default function MalaPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeTrip } = useTripContext()
  const { updateTrip } = useTrips()
  const { items, addItem, updateItem, deleteItem, toggleItem, checkedCount, totalCount, estimatedTotalWeight, loading } = useChecklist(id)

  const [formOpen, setFormOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingLimit, setEditingLimit] = useState(false)
  const [limitInput, setLimitInput] = useState('')
  const [addingBulk, setAddingBulk] = useState(false)

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setEditingItem(undefined)
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function handleEdit(item: ChecklistItem) {
    setEditingItem(item)
    setFormOpen(true)
  }

  async function handleSubmit(data: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editingItem) {
      await updateItem(editingItem.id, data)
    } else {
      await addItem(data)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    await deleteItem(deletingId)
    setDeletingId(null)
  }

  async function saveLimitEdit() {
    const val = Number(limitInput)
    if (!isNaN(val) && val > 0 && id) {
      await updateTrip(id, { luggageWeightLimit: val })
    }
    setEditingLimit(false)
  }

  async function handleSuggestConfirm(
    selected: Array<{ name: string; category: ChecklistCategory; quantity: number; weight: number }>,
  ) {
    if (!id || selected.length === 0) return
    setAddingBulk(true)
    try {
      for (const s of selected) {
        await addItem({
          tripId: id,
          name: s.name,
          category: s.category,
          quantity: s.quantity,
          weight: s.weight,
          checked: false,
          notes: '',
        })
      }
    } finally {
      setAddingBulk(false)
    }
  }

  // Group by category
  const grouped = CATEGORY_ORDER.reduce<Record<ChecklistCategory, ChecklistItem[]>>(
    (acc, cat) => ({ ...acc, [cat]: items.filter((i) => i.category === cat) }),
    {} as Record<ChecklistCategory, ChecklistItem[]>,
  )
  const activeCategories = CATEGORY_ORDER.filter((cat) => grouped[cat].length > 0)
  const existingNames = items.map((i) => i.name)

  const limit = activeTrip?.luggageWeightLimit ?? 10
  const pct = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  if (!id) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-app-text">Minha mala</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSuggestOpen(true)}
            title="Lista sugerida"
            className="flex items-center gap-1.5 border border-primary text-primary px-3 py-2 rounded-xl text-sm font-medium hover:bg-primary-light transition-colors"
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">Sugestões</span>
          </button>
          <button
            onClick={() => { setEditingItem(undefined); setFormOpen(true) }}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>
      </div>

      {addingBulk && (
        <div className="bg-primary-light text-primary text-sm px-4 py-2.5 rounded-xl mb-3 flex items-center gap-2">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
          Adicionando itens…
        </div>
      )}

      {totalCount > 0 && (
        <div className="bg-surface rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-app-text">Progresso</p>
            <p className="text-sm font-bold text-primary">{formatPercent(checkedCount, totalCount)}</p>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted">{checkedCount} de {totalCount} itens</p>
        </div>
      )}

      <WeightBar current={estimatedTotalWeight} limit={limit} label="Peso estimado total" />

      {/* Weight limit editor */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="text-muted text-xs">Limite da mala:</span>
        {editingLimit ? (
          <>
            <input
              type="number"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              min="0.1"
              step="any"
              autoFocus
              className="w-20 border border-primary rounded-lg px-2 py-1 text-xs"
            />
            <button onClick={saveLimitEdit} className="text-xs text-primary font-medium">Salvar</button>
            <button onClick={() => setEditingLimit(false)} className="text-xs text-muted">Cancelar</button>
          </>
        ) : (
          <>
            <span className="text-xs text-app-text font-medium">{limit} kg</span>
            <button
              onClick={() => { setLimitInput(String(limit)); setEditingLimit(true) }}
              className="text-muted hover:text-primary"
            >
              <Pencil size={12} />
            </button>
          </>
        )}
      </div>

      {loading ? (
        <p className="text-center text-muted py-8 text-sm">Carregando...</p>
      ) : activeCategories.length === 0 ? (
        <EmptyState
          icon={Luggage}
          title="Mala vazia"
          description="Adicione itens para organizar o que você vai levar na viagem. Use a lista de sugestões para começar mais rápido!"
          action={{ label: '✨ Ver lista sugerida', onClick: () => setSuggestOpen(true) }}
          secondaryAction={{ label: '+ Adicionar manualmente', onClick: () => setFormOpen(true) }}
        />
      ) : (
        activeCategories.map((cat) => (
          <ChecklistGroup
            key={cat}
            category={cat}
            items={grouped[cat]}
            onToggle={toggleItem}
            onEdit={handleEdit}
            onDelete={(itemId) => setDeletingId(itemId)}
          />
        ))
      )}

      {id && (
        <ChecklistItemForm
          open={formOpen}
          tripId={id}
          initialData={editingItem}
          onSubmit={handleSubmit}
          onClose={() => { setFormOpen(false); setEditingItem(undefined) }}
        />
      )}

      <SuggestedChecklistModal
        open={suggestOpen}
        existingNames={existingNames}
        onConfirm={handleSuggestConfirm}
        onClose={() => setSuggestOpen(false)}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Excluir item"
        description="Este item será removido da lista permanentemente."
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
