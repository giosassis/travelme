import { useEffect, useState, useCallback } from 'react'
import { reservationRepository } from '@/services/storage/reservationRepository'
import type { Reservation } from '@/types'

export function useReservations(tripId: string | undefined) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setReservations([])
      setLoading(false)
      return
    }
    const data = await reservationRepository.getAllByTripId(tripId)
    setReservations(data.sort((a, b) => a.date.localeCompare(b.date)))
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const addReservation = useCallback(
    async (data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reservation> => {
      const now = new Date().toISOString()
      const item: Reservation = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      await reservationRepository.create(item)
      await load()
      return item
    },
    [load],
  )

  const updateReservation = useCallback(
    async (id: string, data: Partial<Omit<Reservation, 'id' | 'createdAt'>>): Promise<void> => {
      const existing = await reservationRepository.getById(id)
      if (!existing) return
      await reservationRepository.update({ ...existing, ...data, updatedAt: new Date().toISOString() })
      await load()
    },
    [load],
  )

  const deleteReservation = useCallback(
    async (id: string): Promise<void> => {
      await reservationRepository.delete(id)
      await load()
    },
    [load],
  )

  return { reservations, addReservation, updateReservation, deleteReservation, loading, refresh: load }
}
