import { useEffect, useState, useCallback } from 'react'
import { budgetCategoryRepository } from '@/services/storage/budgetCategoryRepository'
import type { BudgetCategory, ExpenseCategory } from '@/types'

export function useBudgetCategories(tripId: string | undefined) {
  const [categories, setCategories] = useState<BudgetCategory[]>([])

  const load = useCallback(async () => {
    if (!tripId) {
      setCategories([])
      return
    }
    setCategories(await budgetCategoryRepository.getAllByTripId(tripId))
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const upsertCategory = useCallback(
    async (category: ExpenseCategory, plannedAmount: number): Promise<void> => {
      if (!tripId) return
      const existing = categories.find((c) => c.category === category)
      const now = new Date().toISOString()
      if (existing) {
        await budgetCategoryRepository.update({ ...existing, plannedAmount, updatedAt: now })
      } else {
        await budgetCategoryRepository.create({
          id: crypto.randomUUID(),
          tripId,
          category,
          plannedAmount,
          createdAt: now,
          updatedAt: now,
        })
      }
      await load()
    },
    [tripId, categories, load],
  )

  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      await budgetCategoryRepository.delete(id)
      await load()
    },
    [load],
  )

  return { categories, upsertCategory, deleteCategory, refresh: load }
}
