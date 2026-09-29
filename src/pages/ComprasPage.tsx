import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ShoppingBag, Plus } from 'lucide-react'
import { useShoppingList } from '@/hooks/useShoppingList'
import { ShoppingItemForm } from '@/components/shopping/ShoppingItemForm'
import { ShoppingItemRow } from '@/components/shopping/ShoppingItemRow'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import type { ShoppingItem, ShoppingCategory } from '@/types'
import { formatCurrency, formatPercent } from '@/utils/format'

const CATEGORY_ORDER: ShoppingCategory[] = [
  'Roupa e calçados',
  'Farmácia',
  'Higiene e beleza',
  'Eletrônicos',
  'Alimentos e bebidas',
  'Documentos e viagem',
  'Presentes e lembranças',
  'Outros',
]

const CATEGORY_ICONS: Record<ShoppingCategory, string> = {
  'Roupa e calçados': '👗',
  'Farmácia': '💊',
  'Higiene e beleza': '🧴',
  'Eletrônicos': '📱',
  'Alimentos e bebidas': '🥤',
  'Documentos e viagem': '📄',
  'Presentes e lembranças': '🎁',
  'Outros': '📦',
}

type FilterTab = 'todos' | 'pendentes' | 'comprados'

export default function ComprasPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    items, addItem, updateItem, deleteItem, toggleBought,
    boughtCount, totalCount, totalEstimated, totalActual, pendingEstimated, loading,
  } = useShoppingList(id)

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [tab, setTab] = useState<FilterTab>('todos')

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setEditingItem(undefined)
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function handleEdit(item: ShoppingItem) {
    setEditingItem(item)
    setFormOpen(true)
  }

  async function handleSubmit(data: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>) {
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

  const filteredItems = useMemo(() => {
    if (tab === 'pendentes') return items.filter((i) => !i.bought)
    if (tab === 'comprados') return items.filter((i) => i.bought)
    return items
  }, [items, tab])

  // Group by category
  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<ShoppingCategory, ShoppingItem[]>>(
        (acc, cat) => ({ ...acc, [cat]: filteredItems.filter((i) => i.category === cat) }),
        {} as Record<ShoppingCategory, ShoppingItem[]>,
      ),
    [filteredItems],
  )
  const activeCategories = CATEGORY_ORDER.filter((cat) => grouped[cat].length > 0)
  const pct = totalCount > 0 ? (boughtCount / totalCount) * 100 : 0

  if (!id) return null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-app-text">Lista de compras</h1>
        <button
          onClick={() => { setEditingItem(undefined); setFormOpen(true) }}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {/* Summary cards */}
      {totalCount > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-surface rounded-2xl p-3 shadow-sm">
              <p className="text-xs text-muted mb-0.5">Estimado</p>
              <p className="text-base font-bold text-app-text">{formatCurrency(totalEstimated)}</p>
            </div>
            <div className="bg-surface rounded-2xl p-3 shadow-sm">
              <p className="text-xs text-muted mb-0.5">Gasto até agora</p>
              <p className="text-base font-bold text-success">{formatCurrency(totalActual)}</p>
            </div>
            <div className="bg-surface rounded-2xl p-3 shadow-sm">
              <p className="text-xs text-muted mb-0.5">Ainda falta comprar</p>
              <p className="text-base font-bold text-yellow-600">{formatCurrency(pendingEstimated)}</p>
            </div>
            <div className="bg-surface rounded-2xl p-3 shadow-sm">
              <p className="text-xs text-muted mb-0.5">Itens comprados</p>
              <p className="text-base font-bold text-primary">{boughtCount} / {totalCount}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-surface rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-app-text">Progresso</p>
              <p className="text-sm font-bold text-primary">{formatPercent(boughtCount, totalCount)}</p>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Filter tabs */}
      {totalCount > 0 && (
        <div className="flex gap-2 mb-4">
          {(['todos', 'pendentes', 'comprados'] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                tab === t
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-muted border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'pendentes' ? 'Pendentes' : 'Comprados'}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-center text-muted py-8 text-sm">Carregando...</p>
      ) : totalCount === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Lista vazia"
          description="Adicione os itens que precisa comprar antes ou durante a viagem."
          action={{ label: '+ Adicionar item', onClick: () => setFormOpen(true) }}
        />
      ) : activeCategories.length === 0 ? (
        <p className="text-center text-muted py-8 text-sm">
          {tab === 'pendentes' ? 'Parabéns! Todos os itens já foram comprados. 🎉' : 'Nenhum item comprado ainda.'}
        </p>
      ) : (
        activeCategories.map((cat) => (
          <div key={cat} className="mb-5">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-base">{CATEGORY_ICONS[cat]}</span>
              <span className="text-sm font-semibold text-app-text">{cat}</span>
              <span className="text-xs text-muted ml-auto">
                {grouped[cat].filter((i) => i.bought).length}/{grouped[cat].length}
              </span>
            </div>
            <div className="bg-surface rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
              {grouped[cat].map((item) => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  onToggle={toggleBought}
                  onEdit={handleEdit}
                  onDelete={(itemId) => setDeletingId(itemId)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {id && (
        <ShoppingItemForm
          key={editingItem?.id ?? 'novo'}
          open={formOpen}
          tripId={id}
          initialData={editingItem}
          onSubmit={handleSubmit}
          onClose={() => { setFormOpen(false); setEditingItem(undefined) }}
        />
      )}

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
