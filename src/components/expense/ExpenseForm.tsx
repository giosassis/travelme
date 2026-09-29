import { useState } from 'react'
import { X } from 'lucide-react'
import type { Expense, ExpenseCategory, PaymentMethod, ExpenseStatus } from '@/types'
import { isoToday } from '@/utils/format'

const CATEGORIES: ExpenseCategory[] = [
  'Transporte', 'Hospedagem', 'Alimentação', 'Passeios', 'Compras',
  'Farmácia', 'Higiene e beleza', 'Ingressos', 'Emergência', 'Outros',
]

const PAYMENT_METHODS: PaymentMethod[] = [
  'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Pix', 'Outro',
]

interface FormData {
  description: string
  amount: string
  category: ExpenseCategory
  date: string
  paymentMethod: PaymentMethod
  status: ExpenseStatus
  notes: string
}

interface Props {
  open: boolean
  tripId: string
  initialData?: Expense
  onSubmit: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
}

const defaultForm = (_tripId: string): FormData => ({
  description: '',
  amount: '',
  category: 'Outros',
  date: isoToday(),
  paymentMethod: 'Dinheiro',
  status: 'Pago',
  notes: '',
})

export function ExpenseForm({ open, tripId, initialData, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<FormData>(
    initialData
      ? {
          description: initialData.description,
          amount: String(initialData.amount),
          category: initialData.category,
          date: initialData.date,
          paymentMethod: initialData.paymentMethod,
          status: initialData.status,
          notes: initialData.notes,
        }
      : defaultForm(tripId),
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.description.trim()) e.description = 'Descrição é obrigatória'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0)
      e.amount = 'Valor deve ser maior ou igual a zero'
    if (!form.date) e.date = 'Data é obrigatória'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({
        tripId,
        description: form.description.trim(),
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        paymentMethod: form.paymentMethod,
        status: form.status,
        notes: form.notes.trim(),
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl md:rounded-2xl p-6 w-full md:max-w-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-app-text">
            {initialData ? 'Editar gasto' : 'Novo gasto'}
          </h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Almoço no restaurante"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.description && (
              <p className="text-xs text-danger mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Valor (R$)</label>
              <input
                type="number"
                placeholder="0,00"
                min="0"
                step="any"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Data</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">
                Forma de pagamento
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ExpenseStatus }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">
              Observações (opcional)
            </label>
            <textarea
              placeholder="Notas sobre este gasto..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-60"
          >
            {loading ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Adicionar gasto'}
          </button>
        </form>
      </div>
    </div>
  )
}
