import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'travelme-db'
const DB_VERSION = 1

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = IDBPDatabase<any>

let dbPromise: Promise<AnyDB> | null = null

export function getDB(): Promise<AnyDB> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('trips')) {
          db.createObjectStore('trips', { keyPath: 'id' })
        }
        const withTripId = [
          'expenses',
          'budgetCategories',
          'itinerary',
          'checklist',
          'reservations',
          'notes',
        ] as const
        for (const store of withTripId) {
          if (!db.objectStoreNames.contains(store)) {
            const s = db.createObjectStore(store, { keyPath: 'id' })
            s.createIndex('tripId', 'tripId')
          }
        }
      },
    })
  }
  return dbPromise
}
