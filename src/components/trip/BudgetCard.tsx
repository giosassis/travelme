import { formatCurrency, formatPercent } from '@/utils/format'
import { cn } from '@/lib/utils'

interface Props {
  totalBudget: number
  totalSpent: number
  totalPending: number
  balance: number
  percentUsed: number
}

export function BudgetCard({ totalBudget, totalSpent, totalPending, balance, percentUsed }: Props) {
  const over = percentUsed > 1
  const warn = !over && percentUsed >= 0.8
  const barWidth = Math.min(percentUsed * 100, 100)

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm mb-4">
      <h2 className="font-semibold text-app-text mb-4">Orçamento</h2>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-muted mb-0.5">Orçamento total</p>
          <p className="font-bold text-base text-app-text">{formatCurrency(totalBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-0.5">Gasto realizado</p>
          <p className="font-bold text-base text-danger">{formatCurrency(totalSpent)}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-0.5">Gastos pendentes</p>
          <p className="font-bold text-base text-warning">{formatCurrency(totalPending)}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-0.5">Saldo disponível</p>
          <p className={cn('font-bold text-base', balance >= 0 ? 'text-success' : 'text-danger')}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted">
            {formatCurrency(totalSpent + totalPending)} utilizados
          </span>
          <span
            className={cn(
              'font-medium',
              over ? 'text-danger' : warn ? 'text-warning' : 'text-muted',
            )}
          >
            {over
              ? '⚠️ Orçamento excedido'
              : warn
                ? '⚠️ Atenção — limite próximo'
                : `${formatPercent(totalSpent + totalPending, totalBudget)} utilizado`}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              over ? 'bg-danger' : warn ? 'bg-warning' : 'bg-primary',
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  )
}
