import { NavLink, useParams } from 'react-router-dom'
import { Home, Calendar, Luggage, DollarSign, MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onQuickAdd: () => void
}

export function BottomNav({ onQuickAdd }: Props) {
  const { id } = useParams<{ id: string }>()
  const base = id ? `/viagem/${id}` : ''

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 flex items-center justify-around z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <NavLink
        to={id ? base : '/'}
        end
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors',
            isActive ? 'text-primary' : 'text-muted',
          )
        }
      >
        <Home size={20} />
        <span>Início</span>
      </NavLink>

      <NavLink
        to={`${base}/roteiro`}
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors',
            isActive ? 'text-primary' : 'text-muted',
          )
        }
      >
        <Calendar size={20} />
        <span>Roteiro</span>
      </NavLink>

      <button
        onClick={onQuickAdd}
        className="flex flex-col items-center justify-center w-12 h-12 -mt-4 bg-primary rounded-full shadow-lg text-white"
        aria-label="Adicionar"
      >
        <Plus size={22} />
      </button>

      <NavLink
        to={`${base}/gastos`}
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors',
            isActive ? 'text-primary' : 'text-muted',
          )
        }
      >
        <DollarSign size={20} />
        <span>Gastos</span>
      </NavLink>

      <NavLink
        to={`${base}/mala`}
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors',
            isActive ? 'text-primary' : 'text-muted',
          )
        }
      >
        <Luggage size={20} />
        <span>Mala</span>
      </NavLink>

      {/* "Mais" visible on mobile when not in a trip */}
      {!id && (
        <NavLink
          to="/mais"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors',
              isActive ? 'text-primary' : 'text-muted',
            )
          }
        >
          <MoreHorizontal size={20} />
          <span>Mais</span>
        </NavLink>
      )}
    </nav>
  )
}
