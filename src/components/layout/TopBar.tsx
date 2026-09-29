import { useNavigate } from 'react-router-dom'
import { ChevronDown, MapPin } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'

export function TopBar() {
  const { activeTrip } = useTripContext()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-primary" />
        <span className="font-bold text-app-text">TravelMe</span>
      </div>

      {activeTrip ? (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-muted hover:text-app-text transition-colors"
          aria-label="Trocar de viagem"
        >
          <span className="truncate max-w-[160px]">{activeTrip.name}</span>
          <ChevronDown size={14} />
        </button>
      ) : (
        <button
          onClick={() => navigate('/')}
          className="text-sm text-primary font-medium"
        >
          Selecionar viagem
        </button>
      )}
    </header>
  )
}
