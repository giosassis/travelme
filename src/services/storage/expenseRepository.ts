import { getDB } from './db'
import type { Expense } from '@/types'

export const expenseRepository = {
  async getAllByTripId(tripId: string): Promise<Expense[]> {
    const db = await getDB()
    return (await db.getAllFromIndex('expenses', 'tripId', tripId)) as Expense[]
  },

  async getById(id: string): Promise<Expense | undefined> {
    const db = await getDB()
    return (await db.get('expenses', id)) as Expense | undefined
  },

  async create(expense: Expense): Promise<Expense> {
    const db = await getDB()
    await db.put('expenses', expense)
    return expense
  },

  async update(expense: Expense): Promise<Expense> {
    const db = await getDB()
    await db.put('expenses', expense)
    return expense
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('expenses', id)
  },

  async deleteAllByTripId(tripId: string): Promise<void> {
    const all = await this.getAllByTripId(tripId)
    const db = await getDB()
    await Promise.all(all.map((e) => db.delete('expenses', e.id)))
  },
}
