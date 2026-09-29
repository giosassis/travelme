import { useEffect, useState, useCallback } from 'react'
import { itineraryRepository } from '@/services/storage/itineraryRepository'
import type { ItineraryItem } from '@/types'

export function useItinerary(tripId: string | undefined) {
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setItems([])
      setLoading(false)
      return
    }
    const data = await itineraryRepository.getAllByTripId(tripId)
    setItems(
      data.sort((a, b) => {
        const dateDiff = a.date.localeCompare(b.date)
        if (dateDiff !== 0) return dateDiff
        return (a.startTime || '99:99').localeCompare(b.startTime || '99:99')
      }),
    )
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const addItem = useCallback(
    async (data: Omit<ItineraryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ItineraryItem> => {
      const now = new Date().toISOString()
      const item: ItineraryItem = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      await itineraryRepository.create(item)
      await load()
      return item
    },
    [load],
  )

  const updateItem = useCallback(
    async (id: string, data: Partial<Omit<ItineraryItem, 'id' | 'createdAt'>>): Promise<void> => {
      const existing = await itineraryRepository.getById(id)
      if (!existing) return
      await itineraryRepository.update({ ...existing, ...data, updatedAt: new Date().toISOString() })
      await load()
    },
    [load],
  )

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      await itineraryRepository.delete(id)
      await load()
    },
    [load],
  )

  const toggleStatus = useCallback(
    async (id: string): Promise<void> => {
      const existing = await itineraryRepository.getById(id)
      if (!existing) return
      const nextStatus =
        existing.status === 'Concluído' ? 'Planejado' : 'Concluído'
      await itineraryRepository.update({
        ...existing,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      })
      await load()
    },
    [load],
  )

  return { items, addItem, updateItem, deleteItem, toggleStatus, loading, refresh: load }
}
