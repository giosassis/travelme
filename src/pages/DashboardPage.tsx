import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DollarSign, Calendar, Luggage, MoreHorizontal, ArrowRight } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'
import { useDashboard } from '@/hooks/useDashboard'
import { TripHeader } from '@/components/trip/TripHeader'
import { BudgetCard } from '@/components/trip/BudgetCard'
import { DailyAllowanceCard } from '@/components/trip/DailyAllowanceCard'

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>()
  const { setActiveTrip } = useTripContext()
  const { data, loading } = useDashboard(id)
  const navigate = useNavigate()

  useEffect(() => {
    if (data?.trip) setActiveTrip(data.trip)
  }, [data?.trip, setActiveTrip])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted text-sm">Carregando...</p>
      </div>
    )
  }

  if (!data?.trip) {
    navigate('/', { replace: true })
    return null
  }

  const { trip, totalBudget, totalSpent, totalPending, balance, percentUsed, dailyAllowance, daysRemaining, tripStarted, tripEnded } = data

  const quickLinks = [
    { to: `/viagem/${id}/gastos`, icon: DollarSign, label: 'Gastos', count: data.expenses.length },
    { to: `/viagem/${id}/roteiro`, icon: Calendar, label: 'Roteiro' },
    { to: `/viagem/${id}/mala`, icon: Luggage, label: 'Mala' },
    { to: `/viagem/${id}/mais`, icon: MoreHorizontal, label: 'Mais' },
  ]

  return (
    <div>
      <TripHeader trip={trip} />

      <BudgetCard
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        totalPending={totalPending}
        balance={balance}
        percentUsed={percentUsed}
      />

      <DailyAllowanceCard
        dailyAllowance={dailyAllowance}
        daysRemaining={daysRemaining}
        tripStarted={tripStarted}
        tripEnded={tripEnded}
        balance={balance}
      />

      {/* Quick access */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="bg-surface rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-primary border-2 border-transparent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center">
                <link.icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-app-text">{link.label}</p>
                {link.count !== undefined && (
                  <p className="text-xs text-muted">{link.count} registro{link.count !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            <ArrowRight size={16} className="text-muted" />
          </Link>
        ))}
      </div>
    </div>
  )
}
