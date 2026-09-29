import { getDB } from './db'
import type { BudgetCategory } from '@/types'

export const budgetCategoryRepository = {
  async getAllByTripId(tripId: string): Promise<BudgetCategory[]> {
    const db = await getDB()
    return (await db.getAllFromIndex('budgetCategories', 'tripId', tripId)) as BudgetCategory[]
  },

  async getById(id: string): Promise<BudgetCategory | undefined> {
    const db = await getDB()
    return (await db.get('budgetCategories', id)) as BudgetCategory | undefined
  },

  async create(item: BudgetCategory): Promise<BudgetCategory> {
    const db = await getDB()
    await db.put('budgetCategories', item)
    return item
  },

  async update(item: BudgetCategory): Promise<BudgetCategory> {
    const db = await getDB()
    await db.put('budgetCategories', item)
    return item
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('budgetCategories', id)
  },

  async deleteAllByTripId(tripId: string): Promise<void> {
    const all = await this.getAllByTripId(tripId)
    const db = await getDB()
    await Promise.all(all.map((e) => db.delete('budgetCategories', e.id)))
  },
}
