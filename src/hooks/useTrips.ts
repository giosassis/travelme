import { useCallback } from 'react'
import { useTripContext } from '@/contexts/TripContext'
import { tripRepository } from '@/services/storage/tripRepository'
import { expenseRepository } from '@/services/storage/expenseRepository'
import { budgetCategoryRepository } from '@/services/storage/budgetCategoryRepository'
import { itineraryRepository } from '@/services/storage/itineraryRepository'
import { checklistRepository } from '@/services/storage/checklistRepository'
import { reservationRepository } from '@/services/storage/reservationRepository'
import { noteRepository } from '@/services/storage/noteRepository'
import type { Trip } from '@/types'

export function useTrips() {
  const { trips, refreshTrips, setActiveTrip, activeTrip } = useTripContext()

  const createTrip = useCallback(
    async (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> => {
      const now = new Date().toISOString()
      const trip: Trip = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      await tripRepository.create(trip)
      await refreshTrips()
      return trip
    },
    [refreshTrips],
  )

  const updateTrip = useCallback(
    async (id: string, data: Partial<Omit<Trip, 'id' | 'createdAt'>>): Promise<void> => {
      const existing = await tripRepository.getById(id)
      if (!existing) return
      const updated: Trip = { ...existing, ...data, updatedAt: new Date().toISOString() }
      await tripRepository.update(updated)
      await refreshTrips()
      if (activeTrip?.id === id) setActiveTrip(updated)
    },
    [refreshTrips, activeTrip, setActiveTrip],
  )

  const deleteTrip = useCallback(
    async (id: string): Promise<void> => {
      await tripRepository.delete(id)
      await expenseRepository.deleteAllByTripId(id)
      await budgetCategoryRepository.deleteAllByTripId(id)
      await itineraryRepository.deleteAllByTripId(id)
      await checklistRepository.deleteAllByTripId(id)
      await reservationRepository.deleteAllByTripId(id)
      await noteRepository.deleteAllByTripId(id)
      if (activeTrip?.id === id) setActiveTrip(null)
      await refreshTrips()
    },
    [refreshTrips, activeTrip, setActiveTrip],
  )

  return { trips, createTrip, updateTrip, deleteTrip }
}
