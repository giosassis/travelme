import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Trip } from '@/types'
import { tripRepository } from '@/services/storage/tripRepository'

interface TripContextValue {
  trips: Trip[]
  activeTrip: Trip | null
  setActiveTrip: (trip: Trip | null) => void
  refreshTrips: () => Promise<Trip[]>
  loading: boolean
}

const TripContext = createContext<TripContextValue | null>(null)

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [activeTrip, setActiveTripState] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshTrips = useCallback(async (): Promise<Trip[]> => {
    const all = await tripRepository.getAll()
    const sorted = all.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    setTrips(sorted)
    return sorted
  }, [])

  useEffect(() => {
    const init = async () => {
      const all = await refreshTrips()
      const savedId = localStorage.getItem('travelme-active-trip')
      if (savedId) {
        const found = all.find((t) => t.id === savedId)
        if (found) setActiveTripState(found)
      }
      setLoading(false)
    }
    init()
  }, [refreshTrips])

  const setActiveTrip = useCallback((trip: Trip | null) => {
    setActiveTripState(trip)
    if (trip) localStorage.setItem('travelme-active-trip', trip.id)
    else localStorage.removeItem('travelme-active-trip')
  }, [])

  return (
    <TripContext.Provider value={{ trips, activeTrip, setActiveTrip, refreshTrips, loading }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTripContext() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTripContext must be used within TripProvider')
  return ctx
}
