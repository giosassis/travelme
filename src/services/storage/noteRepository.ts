import { getDB } from './db'
import type { Note } from '@/types'

export const noteRepository = {
  async getAllByTripId(tripId: string): Promise<Note[]> {
    const db = await getDB()
    return (await db.getAllFromIndex('notes', 'tripId', tripId)) as Note[]
  },

  async getById(id: string): Promise<Note | undefined> {
    const db = await getDB()
    return (await db.get('notes', id)) as Note | undefined
  },

  async create(item: Note): Promise<Note> {
    const db = await getDB()
    await db.put('notes', item)
    return item
  },

  async update(item: Note): Promise<Note> {
    const db = await getDB()
    await db.put('notes', item)
    return item
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('notes', id)
  },

  async deleteAllByTripId(tripId: string): Promise<void> {
    const all = await this.getAllByTripId(tripId)
    const db = await getDB()
    await Promise.all(all.map((e) => db.delete('notes', e.id)))
  },
}
