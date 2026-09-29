import { useEffect, useState, useCallback } from 'react'
import { shoppingRepository } from '@/services/storage/shoppingRepository'
import type { ShoppingItem } from '@/types'

export function useShoppingList(tripId: string | undefined) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setItems([])
      setLoading(false)
      return
    }
    const data = await shoppingRepository.getAllByTripId(tripId)
    setItems(
      data.sort((a, b) => {
        const priorityOrder = { Alta: 0, Média: 1, Baixa: 2 }
        const p = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (p !== 0) return p
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      }),
    )
    setLoading(false)
  }, [tripId])

  useEffect(() => { load() }, [load])

  const addItem = useCallback(
    async (data: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShoppingItem> => {
      const now = new Date().toISOString()
      const item: ShoppingItem = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      await shoppingRepository.create(item)
      await load()
      return item
    },
    [load],
  )

  const updateItem = useCallback(
    async (id: string, data: Partial<Omit<ShoppingItem, 'id' | 'createdAt'>>): Promise<void> => {
      const existing = await shoppingRepository.getById(id)
      if (!existing) return
      await shoppingRepository.update({ ...existing, ...data, updatedAt: new Date().toISOString() })
      await load()
    },
    [load],
  )

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      await shoppingRepository.delete(id)
      await load()
    },
    [load],
  )

  const toggleBought = useCallback(
    async (id: string): Promise<void> => {
      const existing = await shoppingRepository.getById(id)
      if (!existing) return
      await shoppingRepository.update({
        ...existing,
        bought: !existing.bought,
        updatedAt: new Date().toISOString(),
      })
      await load()
    },
    [load],
  )

  const boughtCount = items.filter((i) => i.bought).length
  const totalCount = items.length
  const totalEstimated = items.reduce((s, i) => s + i.estimatedPrice * i.quantity, 0)
  const totalActual = items
    .filter((i) => i.bought && i.actualPrice > 0)
    .reduce((s, i) => s + i.actualPrice * i.quantity, 0)
  const pendingEstimated = items
    .filter((i) => !i.bought)
    .reduce((s, i) => s + i.estimatedPrice * i.quantity, 0)

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleBought,
    boughtCount,
    totalCount,
    totalEstimated,
    totalActual,
    pendingEstimated,
    loading,
    refresh: load,
  }
}
