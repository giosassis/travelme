import { getDB } from './db'
import type { Trip } from '@/types'

export const tripRepository = {
  async getAll(): Promise<Trip[]> {
    const db = await getDB()
    return (await db.getAll('trips')) as Trip[]
  },

  async getById(id: string): Promise<Trip | undefined> {
    const db = await getDB()
    return (await db.get('trips', id)) as Trip | undefined
  },

  async create(trip: Trip): Promise<Trip> {
    const db = await getDB()
    await db.put('trips', trip)
    return trip
  },

  async update(trip: Trip): Promise<Trip> {
    const db = await getDB()
    await db.put('trips', trip)
    return trip
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('trips', id)
  },
}
