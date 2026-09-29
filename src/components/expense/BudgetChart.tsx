import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { BudgetCategory, Expense } from '@/types'
import { formatCurrency } from '@/utils/format'

interface Props {
  budgetCategories: BudgetCategory[]
  expenses: Expense[]
}

export function BudgetChart({ budgetCategories, expenses }: Props) {
  const data = budgetCategories
    .filter((c) => c.plannedAmount > 0)
    .map((c) => {
      const realized = expenses
        .filter((e) => e.category === c.category && e.status === 'Pago')
        .reduce((s, e) => s + e.amount, 0)
      return {
        name: c.category,
        Planejado: c.plannedAmount,
        Realizado: realized,
      }
    })

  if (data.length === 0) return null

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm mt-4">
      <h3 className="font-semibold text-app-text text-sm mb-4">Gráfico por categoria</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#777487' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#777487' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
            }
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Planejado" fill="#8B7CF6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Realizado" fill="#315C68" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
