import { TrendingDown, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/lib/utils'

interface Props {
  dailyAllowance: number
  daysRemaining: number
  tripStarted: boolean
  tripEnded: boolean
  balance: number
}

export function DailyAllowanceCard({
  dailyAllowance,
  daysRemaining,
  tripStarted,
  tripEnded,
  balance,
}: Props) {
  const isNegative = balance < 0

  let message: string
  if (tripEnded) {
    message = `Viagem encerrada. Saldo final: ${formatCurrency(balance)}`
  } else if (daysRemaining === 0 && tripStarted) {
    message = `Último dia da viagem! Saldo atual: ${formatCurrency(balance)}`
  } else if (!tripStarted) {
    message = `Você tem aproximadamente ${formatCurrency(Math.abs(dailyAllowance))} por dia disponíveis para esta viagem.`
  } else {
    message = `Você pode gastar aproximadamente ${formatCurrency(Math.max(0, dailyAllowance))} por dia até o fim da viagem.`
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-4 mb-4 flex items-start gap-3',
        isNegative ? 'bg-danger/10' : 'bg-teal-light',
      )}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          isNegative ? 'bg-danger' : 'bg-teal',
        )}
      >
        {isNegative ? (
          <AlertCircle size={16} className="text-white" />
        ) : (
          <TrendingDown size={16} className="text-white" />
        )}
      </div>
      <div>
        <p className={cn('text-xs font-medium mb-0.5', isNegative ? 'text-danger' : 'text-teal')}>
          {isNegative ? 'Orçamento excedido' : 'Disponível por dia'}
        </p>
        <p className={cn('text-sm', isNegative ? 'text-danger' : 'text-teal')}>{message}</p>
      </div>
    </div>
  )
}
