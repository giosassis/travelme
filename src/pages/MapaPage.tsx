import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Map, MapPin, Calendar, BookOpen, AlertCircle } from 'lucide-react'
import { useItinerary } from '@/hooks/useItinerary'
import { useReservations } from '@/hooks/useReservations'
import { MapView } from '@/components/maps/MapView'
import type { MapPoint } from '@/services/maps/mapService'
import { formatDateLong } from '@/utils/format'

type FilterType = 'todos' | 'roteiro' | 'reservas'

const ITINERARY_COLOR = '#8B7CF6'   // primary lilac
const RESERVATION_COLOR = '#315C68'  // teal

const LEGEND = [
  { color: ITINERARY_COLOR, label: 'Roteiro' },
  { color: RESERVATION_COLOR, label: 'Reservas' },
]

export default function MapaPage() {
  const { id } = useParams<{ id: string }>()
  const { items: itineraryItems, loading: loadingItinerary } = useItinerary(id)
  const { reservations, loading: loadingReservations } = useReservations(id)
  const [filter, setFilter] = useState<FilterType>('todos')

  const itineraryPoints = useMemo<MapPoint[]>(
    () =>
      itineraryItems
        .filter((item) => item.location?.latitude != null && item.location?.longitude != null)
        .map((item) => ({
          id: `itinerary-${item.id}`,
          lat: item.location!.latitude!,
          lng: item.location!.longitude!,
          label: item.title,
          subtitle: formatDateLong(item.date) + (item.startTime ? ` — ${item.startTime}` : ''),
          color: ITINERARY_COLOR,
          category: item.category,
        })),
    [itineraryItems],
  )

  const reservationPoints = useMemo<MapPoint[]>(
    () =>
      reservations
        .filter((r) => r.location?.latitude != null && r.location?.longitude != null)
        .map((r) => ({
          id: `reservation-${r.id}`,
          lat: r.location!.latitude!,
          lng: r.location!.longitude!,
          label: r.name,
          subtitle: r.type + (r.confirmationCode ? ` · ${r.confirmationCode}` : ''),
          color: RESERVATION_COLOR,
          category: r.type,
        })),
    [reservations],
  )

  const visiblePoints = useMemo<MapPoint[]>(() => {
    if (filter === 'roteiro') return itineraryPoints
    if (filter === 'reservas') return reservationPoints
    return [...itineraryPoints, ...reservationPoints]
  }, [filter, itineraryPoints, reservationPoints])

  const loading = loadingItinerary || loadingReservations
  const totalWithCoords = itineraryPoints.length + reservationPoints.length
  const totalItems = itineraryItems.length + reservations.length

  if (!id) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Map size={20} className="text-primary" />
        <h1 className="text-xl font-bold text-app-text">Mapa da viagem</h1>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['todos', 'roteiro', 'reservas'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-muted border-gray-200 hover:border-primary hover:text-primary'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'roteiro' ? 'Roteiro' : 'Reservas'}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: l.color }} />
            <span className="text-xs text-muted">{l.label}</span>
          </div>
        ))}
        {totalWithCoords > 0 && (
          <span className="text-xs text-muted ml-auto">
            {visiblePoints.length} local{visiblePoints.length !== 1 ? 'is' : ''} visível{visiblePoints.length !== 1 ? 'is' : ''}
          </span>
        )}
      </div>

      {/* Map container */}
      {loading ? (
        <div className="bg-surface rounded-2xl flex items-center justify-center h-64">
          <p className="text-muted text-sm">Carregando mapa…</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <MapView
            points={visiblePoints}
            className="w-full h-[55vh] min-h-[280px] max-h-[480px]"
          />
        </div>
      )}

      {/* Info callout — when there are items but none with coordinates */}
      {!loading && totalItems > 0 && totalWithCoords === 0 && (
        <div className="mt-4 flex gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
          <AlertCircle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Nenhum local com coordenadas</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Para aparecer no mapa, as atividades e reservas precisam ter um local com latitude e longitude
              preenchidos. Edite os itens do roteiro ou reservas e adicione um local.
            </p>
          </div>
        </div>
      )}

      {/* Empty state — no items at all */}
      {!loading && totalItems === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-3">
            <MapPin size={24} className="text-primary" />
          </div>
          <h3 className="font-semibold text-app-text mb-2">Nenhum local cadastrado</h3>
          <p className="text-sm text-muted max-w-xs">
            Adicione atividades ao roteiro ou cadastre reservas com localização para visualizá-las no mapa.
          </p>
        </div>
      )}

      {/* Point list below the map */}
      {!loading && visiblePoints.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-app-text mb-2">Locais no mapa</h2>
          <div className="flex flex-col gap-2">
            {visiblePoints.map((pt) => (
              <div key={pt.id} className="bg-surface rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                <div
                  className="w-3 h-3 rounded-full shrink-0 mt-1 border-2 border-white shadow-sm"
                  style={{ background: pt.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-app-text truncate">{pt.label}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {pt.subtitle && <p className="text-xs text-muted">{pt.subtitle}</p>}
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: pt.color === ITINERARY_COLOR ? '#EAE7FF' : '#DCECEF',
                        color: pt.color,
                      }}
                    >
                      {pt.category}
                    </span>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1 shrink-0">
                  {pt.color === ITINERARY_COLOR ? (
                    <Calendar size={14} className="text-primary" />
                  ) : (
                    <BookOpen size={14} className="text-teal" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
