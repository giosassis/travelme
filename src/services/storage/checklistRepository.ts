import { getDB } from './db'
import type { ChecklistItem } from '@/types'

export const checklistRepository = {
  async getAllByTripId(tripId: string): Promise<ChecklistItem[]> {
    const db = await getDB()
    return (await db.getAllFromIndex('checklist', 'tripId', tripId)) as ChecklistItem[]
  },

  async getById(id: string): Promise<ChecklistItem | undefined> {
    const db = await getDB()
    return (await db.get('checklist', id)) as ChecklistItem | undefined
  },

  async create(item: ChecklistItem): Promise<ChecklistItem> {
    const db = await getDB()
    await db.put('checklist', item)
    return item
  },

  async update(item: ChecklistItem): Promise<ChecklistItem> {
    const db = await getDB()
    await db.put('checklist', item)
    return item
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('checklist', id)
  },

  async deleteAllByTripId(tripId: string): Promise<void> {
    const all = await this.getAllByTripId(tripId)
    const db = await getDB()
    await Promise.all(all.map((e) => db.delete('checklist', e.id)))
  },
}
