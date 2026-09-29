import { NavLink, useParams } from 'react-router-dom'
import { Home, Calendar, DollarSign, Luggage, MoreHorizontal, MapPin, Map } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { activeTrip } = useTripContext()
  const { id } = useParams<{ id: string }>()
  const base = id ? `/viagem/${id}` : ''

  const navItems = [
    { to: id ? base : '/', icon: Home, label: 'Início', end: true },
    { to: `${base}/roteiro`, icon: Calendar, label: 'Roteiro', disabled: !id },
    { to: `${base}/gastos`, icon: DollarSign, label: 'Gastos', disabled: !id },
    { to: `${base}/mala`, icon: Luggage, label: 'Mala', disabled: !id },
    { to: `${base}/mais/mapa`, icon: Map, label: 'Mapa', disabled: !id },
    { to: `${base}/mais`, icon: MoreHorizontal, label: 'Mais', disabled: !id },
  ]

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-surface border-r border-gray-100 px-3 py-6 fixed left-0 top-0 z-20">
      <div className="flex items-center gap-2 px-3 mb-8">
        <MapPin size={20} className="text-primary" />
        <span className="font-bold text-lg text-app-text">TravelMe</span>
      </div>

      {activeTrip && (
        <div className="px-3 mb-6">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Viagem ativa</p>
          <p className="text-sm font-semibold text-app-text truncate">{activeTrip.name}</p>
          <p className="text-xs text-muted truncate">{activeTrip.destination}</p>
        </div>
      )}

      <nav className="flex flex-col gap-1">
        {navItems.map((item) =>
          item.disabled ? (
            <span
              key={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted/40 cursor-not-allowed"
            >
              <item.icon size={18} />
              {item.label}
            </span>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                  isActive
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-muted hover:bg-gray-50 hover:text-app-text',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  )
}
