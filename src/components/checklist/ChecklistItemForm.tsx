import { useState } from 'react'
import { X } from 'lucide-react'
import type { ChecklistItem, ChecklistCategory } from '@/types'

const CATEGORIES: ChecklistCategory[] = [
  'Roupas', 'Higiene e beleza', 'Farmácia', 'Eletrônicos',
  'Documentos', 'Praia', 'Acessórios', 'Outros',
]

interface Props {
  open: boolean
  tripId: string
  initialData?: ChecklistItem
  onSubmit: (data: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
}

export function ChecklistItemForm({ open, tripId, initialData, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    category: (initialData?.category ?? 'Outros') as ChecklistCategory,
    quantity: initialData?.quantity !== undefined ? String(initialData.quantity) : '1',
    weight: initialData?.weight !== undefined ? String(initialData.weight) : '0',
    notes: initialData?.notes ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.quantity || Number(form.quantity) < 1 || isNaN(Number(form.quantity)))
      e.quantity = 'Quantidade deve ser pelo menos 1'
    if (isNaN(Number(form.weight)) || Number(form.weight) < 0)
      e.weight = 'Peso não pode ser negativo'
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
        name: form.name.trim(),
        category: form.category,
        quantity: Number(form.quantity),
        weight: Number(form.weight),
        checked: initialData?.checked ?? false,
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
            {initialData ? 'Editar item' : 'Novo item da mala'}
          </h2>
          <button onClick={onClose} aria-label="Fechar"><X size={20} className="text-muted" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Nome do item</label>
            <input
              type="text"
              placeholder="Ex: Camisetas"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ChecklistCategory }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Quantidade</label>
              <input
                type="number" min="1" step="1"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.quantity && <p className="text-xs text-danger mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Peso estimado (kg)</label>
              <input
                type="number" min="0" step="any" placeholder="0"
                value={form.weight}
                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.weight && <p className="text-xs text-danger mt-1">{errors.weight}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Notas (opcional)</label>
            <textarea
              placeholder="Observações..."
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
            {loading ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Adicionar item'}
          </button>
        </form>
      </div>
    </div>
  )
}
