import { useEffect, useState, useCallback } from 'react'
import { expenseRepository } from '@/services/storage/expenseRepository'
import type { Expense } from '@/types'

export function useExpenses(tripId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setExpenses([])
      setLoading(false)
      return
    }
    const data = await expenseRepository.getAllByTripId(tripId)
    setExpenses(data.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)))
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const addExpense = useCallback(
    async (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> => {
      const now = new Date().toISOString()
      const expense: Expense = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      await expenseRepository.create(expense)
      await load()
      return expense
    },
    [load],
  )

  const updateExpense = useCallback(
    async (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<void> => {
      const existing = await expenseRepository.getById(id)
      if (!existing) return
      const updated: Expense = { ...existing, ...data, updatedAt: new Date().toISOString() }
      await expenseRepository.update(updated)
      await load()
    },
    [load],
  )

  const deleteExpense = useCallback(
    async (id: string): Promise<void> => {
      await expenseRepository.delete(id)
      await load()
    },
    [load],
  )

  return { expenses, addExpense, updateExpense, deleteExpense, loading, refresh: load }
}
