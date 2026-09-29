import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlaneTakeoff, Plus } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'
import { useTrips } from '@/hooks/useTrips'
import { TripCard } from '@/components/trip/TripCard'
import { TripForm } from '@/components/trip/TripForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import type { Trip } from '@/types'

export default function TripsPage() {
  const { trips, activeTrip, setActiveTrip, loading } = useTripContext()
  const { createTrip, updateTrip, deleteTrip } = useTrips()
  const navigate = useNavigate()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleSelect(trip: Trip) {
    setActiveTrip(trip)
    navigate(`/viagem/${trip.id}`)
  }

  function handleEdit(trip: Trip) {
    setEditingTrip(trip)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    setEditingTrip(undefined)
  }

  async function handleSubmit(data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editingTrip) {
      await updateTrip(editingTrip.id, data)
    } else {
      const newTrip = await createTrip(data)
      setActiveTrip(newTrip)
      navigate(`/viagem/${newTrip.id}`)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    await deleteTrip(deletingId)
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-app-text">Minhas viagens</h1>
          <p className="text-sm text-muted mt-0.5">Sua viagem, organizada do seu jeito.</p>
        </div>
        <button
          onClick={() => { setEditingTrip(undefined); setFormOpen(true) }}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={16} />
          Nova viagem
        </button>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={PlaneTakeoff}
          title="Nenhuma viagem ainda"
          description="Crie sua primeira viagem e comece a planejar cada detalhe com carinho."
          action={{ label: '+ Nova viagem', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              isActive={activeTrip?.id === trip.id}
              onSelect={() => handleSelect(trip)}
              onEdit={() => handleEdit(trip)}
              onDelete={() => setDeletingId(trip.id)}
            />
          ))}
        </div>
      )}

      <TripForm
        open={formOpen}
        initialData={editingTrip}
        onSubmit={handleSubmit}
        onClose={handleCloseForm}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Excluir viagem"
        description="Todos os dados desta viagem (gastos, roteiro, checklist, reservas e notas) serão apagados permanentemente. Esta ação não pode ser desfeita."
        confirmLabel="Excluir viagem"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
