import { getDB } from './db'
import type { ItineraryItem } from '@/types'

export const itineraryRepository = {
  async getAllByTripId(tripId: string): Promise<ItineraryItem[]> {
    const db = await getDB()
    return (await db.getAllFromIndex('itinerary', 'tripId', tripId)) as ItineraryItem[]
  },

  async getById(id: string): Promise<ItineraryItem | undefined> {
    const db = await getDB()
    return (await db.get('itinerary', id)) as ItineraryItem | undefined
  },

  async create(item: ItineraryItem): Promise<ItineraryItem> {
    const db = await getDB()
    await db.put('itinerary', item)
    return item
  },

  async update(item: ItineraryItem): Promise<ItineraryItem> {
    const db = await getDB()
    await db.put('itinerary', item)
    return item
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('itinerary', id)
  },

  async deleteAllByTripId(tripId: string): Promise<void> {
    const all = await this.getAllByTripId(tripId)
    const db = await getDB()
    await Promise.all(all.map((e) => db.delete('itinerary', e.id)))
  },
}
