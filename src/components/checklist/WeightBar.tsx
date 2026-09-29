import { formatWeight, formatPercent } from '@/utils/format'
import { cn } from '@/lib/utils'

interface Props {
  current: number
  limit: number
  label?: string
}

export function WeightBar({ current, limit, label }: Props) {
  const pct = limit > 0 ? current / limit : 0
  const over = pct > 1
  const warn = !over && pct >= 0.8
  const barWidth = Math.min(pct * 100, 100)

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-app-text">{label ?? 'Peso estimado da mala'}</p>
        <p className={cn('text-sm font-bold', over ? 'text-danger' : warn ? 'text-warning' : 'text-app-text')}>
          {formatWeight(current)} / {formatWeight(limit)}
        </p>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={cn('h-full rounded-full transition-all duration-500', over ? 'bg-danger' : warn ? 'bg-warning' : 'bg-primary')}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className={cn('text-xs', over ? 'text-danger font-medium' : warn ? 'text-warning font-medium' : 'text-muted')}>
        {over
          ? `⚠️ Excedido em ${formatWeight(current - limit)}`
          : warn
            ? `⚠️ Atenção — ${formatWeight(limit - current)} disponíveis`
            : `${formatWeight(limit - current)} disponíveis · ${formatPercent(current, limit)} utilizado`}
      </p>
    </div>
  )
}
