import { getDB } from './db'
import type { Reservation } from '@/types'

export const reservationRepository = {
  async getAllByTripId(tripId: string): Promise<Reservation[]> {
    const db = await getDB()
    return (await db.getAllFromIndex('reservations', 'tripId', tripId)) as Reservation[]
  },

  async getById(id: string): Promise<Reservation | undefined> {
    const db = await getDB()
    return (await db.get('reservations', id)) as Reservation | undefined
  },

  async create(item: Reservation): Promise<Reservation> {
    const db = await getDB()
    await db.put('reservations', item)
    return item
  },

  async update(item: Reservation): Promise<Reservation> {
    const db = await getDB()
    await db.put('reservations', item)
    return item
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('reservations', id)
  },

  async deleteAllByTripId(tripId: string): Promise<void> {
    const all = await this.getAllByTripId(tripId)
    const db = await getDB()
    await Promise.all(all.map((e) => db.delete('reservations', e.id)))
  },
}
