import { getDB } from './db'
import type { ShoppingItem } from '@/types'

export const shoppingRepository = {
  async getAllByTripId(tripId: string): Promise<ShoppingItem[]> {
    const db = await getDB()
    return (await db.getAllFromIndex('shoppingList', 'tripId', tripId)) as ShoppingItem[]
  },

  async getById(id: string): Promise<ShoppingItem | undefined> {
    const db = await getDB()
    return (await db.get('shoppingList', id)) as ShoppingItem | undefined
  },

  async create(item: ShoppingItem): Promise<ShoppingItem> {
    const db = await getDB()
    await db.put('shoppingList', item)
    return item
  },

  async update(item: ShoppingItem): Promise<ShoppingItem> {
    const db = await getDB()
    await db.put('shoppingList', item)
    return item
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('shoppingList', id)
  },

  async deleteAllByTripId(tripId: string): Promise<void> {
    const all = await this.getAllByTripId(tripId)
    const db = await getDB()
    await Promise.all(all.map((e) => db.delete('shoppingList', e.id)))
  },
}
