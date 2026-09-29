import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Calendar, Plus } from 'lucide-react'
import { useItinerary } from '@/hooks/useItinerary'
import { ItineraryDay } from '@/components/itinerary/ItineraryDay'
import { ActivityForm } from '@/components/itinerary/ActivityForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import type { ItineraryItem } from '@/types'
import { isoToday } from '@/utils/format'

export default function RoteiPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, addItem, updateItem, deleteItem, toggleStatus, loading } = useItinerary(id)

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItineraryItem | undefined>()
  const [defaultDate, setDefaultDate] = useState<string>(isoToday())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setEditingItem(undefined)
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function handleAdd(date: string) {
    setDefaultDate(date)
    setEditingItem(undefined)
    setFormOpen(true)
  }

  function handleEdit(item: ItineraryItem) {
    setEditingItem(item)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    setEditingItem(undefined)
  }

  async function handleSubmit(data: Omit<ItineraryItem, 'id' | 'createdAt' | 'updatedAt'>) {
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

  // Group items by date
  const grouped = items.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort()

  if (!id) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-app-text">Roteiro</h1>
        <button
          onClick={() => { setEditingItem(undefined); setDefaultDate(isoToday()); setFormOpen(true) }}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {loading ? (
        <p className="text-center text-muted py-8 text-sm">Carregando...</p>
      ) : sortedDates.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Roteiro vazio"
          description="Adicione atividades, passeios, refeições e mais para organizar seus dias."
          action={{ label: '+ Adicionar atividade', onClick: () => setFormOpen(true) }}
        />
      ) : (
        sortedDates.map((date) => (
          <ItineraryDay
            key={date}
            date={date}
            items={grouped[date]}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={(itemId) => setDeletingId(itemId)}
            onToggle={(itemId) => toggleStatus(itemId)}
          />
        ))
      )}

      {id && (
        <ActivityForm
          open={formOpen}
          tripId={id}
          initialData={editingItem}
          defaultDate={defaultDate}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        title="Excluir atividade"
        description="Esta atividade será removida permanentemente do roteiro."
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
