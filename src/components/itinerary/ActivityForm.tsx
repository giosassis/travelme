import { useState } from 'react'
import { X } from 'lucide-react'
import type { ItineraryItem, ItineraryCategory, ItineraryStatus, Location } from '@/types'
import { isoToday } from '@/utils/format'
import { LocationField } from '@/components/common/LocationField'

const CATEGORIES: ItineraryCategory[] = [
  'Transporte', 'Alimentação', 'Passeio', 'Praia', 'Compras', 'Descanso', 'Outro',
]
const STATUSES: ItineraryStatus[] = ['Planejado', 'Confirmado', 'Concluído', 'Cancelado']

interface Props {
  open: boolean
  tripId: string
  initialData?: ItineraryItem
  defaultDate?: string
  onSubmit: (data: Omit<ItineraryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
}

export function ActivityForm({ open, tripId, initialData, defaultDate, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    date: initialData?.date ?? defaultDate ?? isoToday(),
    startTime: initialData?.startTime ?? '',
    endTime: initialData?.endTime ?? '',
    category: (initialData?.category ?? 'Outro') as ItineraryCategory,
    status: (initialData?.status ?? 'Planejado') as ItineraryStatus,
    estimatedCost: initialData?.estimatedCost !== undefined ? String(initialData.estimatedCost) : '',
    actualCost: initialData?.actualCost !== undefined ? String(initialData.actualCost) : '',
    description: initialData?.description ?? '',
    notes: initialData?.notes ?? '',
    location: initialData?.location ?? null as Location | null,
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {}
    if (!form.title.trim()) e.title = 'Título é obrigatório'
    if (!form.date) e.date = 'Data é obrigatória'
    if (form.estimatedCost && (isNaN(Number(form.estimatedCost)) || Number(form.estimatedCost) < 0))
      e.estimatedCost = 'Custo estimado inválido'
    if (form.actualCost && (isNaN(Number(form.actualCost)) || Number(form.actualCost) < 0))
      e.actualCost = 'Custo real inválido'
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
        title: form.title.trim(),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        category: form.category,
        status: form.status,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : 0,
        actualCost: form.actualCost ? Number(form.actualCost) : 0,
        description: form.description.trim(),
        notes: form.notes.trim(),
        location: form.location,
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
            {initialData ? 'Editar atividade' : 'Nova atividade'}
          </h2>
          <button onClick={onClose} aria-label="Fechar"><X size={20} className="text-muted" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Título</label>
            <input
              type="text"
              placeholder="Ex: Praia de Tambaú"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 md:col-span-1">
              <label className="block text-sm font-medium text-app-text mb-1">Data</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Início</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Fim</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ItineraryCategory }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ItineraryStatus }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Custo estimado (R$)</label>
              <input
                type="number" min="0" step="any" placeholder="0,00"
                value={form.estimatedCost}
                onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.estimatedCost && <p className="text-xs text-danger mt-1">{errors.estimatedCost}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Custo real (R$)</label>
              <input
                type="number" min="0" step="any" placeholder="0,00"
                value={form.actualCost}
                onChange={(e) => setForm((f) => ({ ...f, actualCost: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.actualCost && <p className="text-xs text-danger mt-1">{errors.actualCost}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Descrição (opcional)</label>
            <textarea
              placeholder="Detalhes da atividade..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none bg-white"
            />
          </div>

          <LocationField
            value={form.location}
            onChange={(loc) => setForm((f) => ({ ...f, location: loc }))}
          />

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
            {loading ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Adicionar atividade'}
          </button>
        </form>
      </div>
    </div>
  )
}
