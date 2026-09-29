import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'travelme-db'
const DB_VERSION = 2

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = IDBPDatabase<any>

let dbPromise: Promise<AnyDB> | null = null

export function getDB(): Promise<AnyDB> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // v1 → create all original stores
        if (oldVersion < 1) {
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
        }
        // v2 → add shoppingList store
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('shoppingList')) {
            const s = db.createObjectStore('shoppingList', { keyPath: 'id' })
            s.createIndex('tripId', 'tripId')
          }
        }
      },
    })
  }
  return dbPromise
}
