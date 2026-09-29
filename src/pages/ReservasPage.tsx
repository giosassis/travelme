import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { BookOpen, Plus } from 'lucide-react'
import { useReservations } from '@/hooks/useReservations'
import { ReservationCard } from '@/components/reservation/ReservationCard'
import { ReservationForm } from '@/components/reservation/ReservationForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import type { Reservation, ReservationType } from '@/types'
import { cn } from '@/lib/utils'

const FILTER_TYPES: Array<ReservationType | 'Todas'> = [
  'Todas', 'Voo', 'Hospedagem', 'Passeio', 'Restaurante', 'Transporte', 'Ingresso', 'Outro',
]

export default function ReservasPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { reservations, addReservation, updateReservation, deleteReservation, loading } = useReservations(id)

  const [filter, setFilter] = useState<ReservationType | 'Todas'>('Todas')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Reservation | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setEditingItem(undefined)
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function handleEdit(item: Reservation) {
    setEditingItem(item)
    setFormOpen(true)
  }

  async function handleSubmit(data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editingItem) {
      await updateReservation(editingItem.id, data)
    } else {
      await addReservation(data)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    await deleteReservation(deletingId)
    setDeletingId(null)
  }

  const filtered = filter === 'Todas' ? reservations : reservations.filter((r) => r.type === filter)

  if (!id) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-app-text">Reservas</h1>
        <button
          onClick={() => { setEditingItem(undefined); setFormOpen(true) }}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {/* Filter chips */}
      {reservations.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
          {FILTER_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                'shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors',
                filter === t
                  ? 'bg-primary text-white border-primary'
                  : 'text-muted border-gray-200 hover:border-primary hover:text-primary',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-center text-muted py-8 text-sm">Carregando...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={filter === 'Todas' ? 'Nenhuma reserva ainda' : `Nenhuma reserva do tipo "${filter}"`}
          description="Adicione voos, hospedagens, passeios e outras reservas para manter tudo organizado."
          action={filter === 'Todas' ? { label: '+ Nova reserva', onClick: () => setFormOpen(true) } : undefined}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onEdit={() => handleEdit(r)}
              onDelete={() => setDeletingId(r.id)}
            />
          ))}
        </div>
      )}

      {id && (
        <ReservationForm
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
        title="Excluir reserva"
        description="Esta reserva será excluída permanentemente."
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
