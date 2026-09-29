import { useState } from 'react'
import { X } from 'lucide-react'
import type { ShoppingItem, ShoppingCategory } from '@/types'

const CATEGORIES: ShoppingCategory[] = [
  'Roupa e calçados',
  'Farmácia',
  'Higiene e beleza',
  'Eletrônicos',
  'Alimentos e bebidas',
  'Documentos e viagem',
  'Presentes e lembranças',
  'Outros',
]

interface Props {
  open: boolean
  tripId: string
  initialData?: ShoppingItem
  onSubmit: (data: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
}

export function ShoppingItemForm({ open, tripId, initialData, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    category: (initialData?.category ?? 'Outros') as ShoppingCategory,
    quantity: initialData?.quantity !== undefined ? String(initialData.quantity) : '1',
    estimatedPrice: initialData?.estimatedPrice ? String(initialData.estimatedPrice) : '',
    actualPrice: initialData?.actualPrice ? String(initialData.actualPrice) : '',
    priority: (initialData?.priority ?? 'Média') as ShoppingItem['priority'],
    notes: initialData?.notes ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.quantity || Number(form.quantity) < 1 || isNaN(Number(form.quantity)))
      e.quantity = 'Quantidade deve ser pelo menos 1'
    if (form.estimatedPrice && (isNaN(Number(form.estimatedPrice)) || Number(form.estimatedPrice) < 0))
      e.estimatedPrice = 'Preço inválido'
    if (form.actualPrice && (isNaN(Number(form.actualPrice)) || Number(form.actualPrice) < 0))
      e.actualPrice = 'Preço inválido'
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
        estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : 0,
        actualPrice: form.actualPrice ? Number(form.actualPrice) : 0,
        priority: form.priority,
        bought: initialData?.bought ?? false,
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
            {initialData ? 'Editar item' : 'Novo item'}
          </h2>
          <button onClick={onClose} aria-label="Fechar"><X size={20} className="text-muted" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Nome do item</label>
            <input
              type="text"
              placeholder="Ex: Protetor solar"
              value={form.name}
              autoFocus
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ShoppingCategory }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Prioridade</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as ShoppingItem['priority'] }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="Alta">🔴 Alta</option>
                <option value="Média">🟡 Média</option>
                <option value="Baixa">🟢 Baixa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Qtd.</label>
              <input
                type="number" min="1" step="1"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.quantity && <p className="text-xs text-danger mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Preço est. (R$)</label>
              <input
                type="number" min="0" step="any" placeholder="0,00"
                value={form.estimatedPrice}
                onChange={(e) => setForm((f) => ({ ...f, estimatedPrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.estimatedPrice && <p className="text-xs text-danger mt-1">{errors.estimatedPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Preço real (R$)</label>
              <input
                type="number" min="0" step="any" placeholder="0,00"
                value={form.actualPrice}
                onChange={(e) => setForm((f) => ({ ...f, actualPrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.actualPrice && <p className="text-xs text-danger mt-1">{errors.actualPrice}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Notas (opcional)</label>
            <textarea
              placeholder="Onde comprar, marca preferida…"
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
