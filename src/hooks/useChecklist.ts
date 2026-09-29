import { useEffect, useState, useCallback } from 'react'
import { checklistRepository } from '@/services/storage/checklistRepository'
import type { ChecklistItem } from '@/types'

export function useChecklist(tripId: string | undefined) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setItems([])
      setLoading(false)
      return
    }
    const data = await checklistRepository.getAllByTripId(tripId)
    setItems(data.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)))
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const addItem = useCallback(
    async (data: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChecklistItem> => {
      const now = new Date().toISOString()
      const item: ChecklistItem = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      await checklistRepository.create(item)
      await load()
      return item
    },
    [load],
  )

  const updateItem = useCallback(
    async (id: string, data: Partial<Omit<ChecklistItem, 'id' | 'createdAt'>>): Promise<void> => {
      const existing = await checklistRepository.getById(id)
      if (!existing) return
      await checklistRepository.update({ ...existing, ...data, updatedAt: new Date().toISOString() })
      await load()
    },
    [load],
  )

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      await checklistRepository.delete(id)
      await load()
    },
    [load],
  )

  const toggleItem = useCallback(
    async (id: string): Promise<void> => {
      const existing = await checklistRepository.getById(id)
      if (!existing) return
      await checklistRepository.update({
        ...existing,
        checked: !existing.checked,
        updatedAt: new Date().toISOString(),
      })
      await load()
    },
    [load],
  )

  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length
  const totalWeight = items
    .filter((i) => i.checked)
    .reduce((s, i) => s + i.weight * i.quantity, 0)
  const estimatedTotalWeight = items.reduce((s, i) => s + i.weight * i.quantity, 0)

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleItem,
    checkedCount,
    totalCount,
    totalWeight,
    estimatedTotalWeight,
    loading,
    refresh: load,
  }
}
