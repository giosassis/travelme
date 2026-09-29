import { useState } from 'react'
import { X } from 'lucide-react'
import type { Reservation, ReservationType, ReservationStatus, Location } from '@/types'
import { isoToday } from '@/utils/format'
import { LocationField } from '@/components/common/LocationField'

const TYPES: ReservationType[] = [
  'Voo', 'Hospedagem', 'Passeio', 'Restaurante', 'Transporte', 'Ingresso', 'Outro',
]
const STATUSES: ReservationStatus[] = ['Confirmado', 'Pendente', 'Cancelado']

interface Props {
  open: boolean
  tripId: string
  initialData?: Reservation
  onSubmit: (data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
}

export function ReservationForm({ open, tripId, initialData, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    type: (initialData?.type ?? 'Outro') as ReservationType,
    name: initialData?.name ?? '',
    date: initialData?.date ?? isoToday(),
    startTime: initialData?.startTime ?? '',
    endTime: initialData?.endTime ?? '',
    confirmationCode: initialData?.confirmationCode ?? '',
    cost: initialData?.cost !== undefined ? String(initialData.cost) : '',
    status: (initialData?.status ?? 'Confirmado') as ReservationStatus,
    notes: initialData?.notes ?? '',
    location: initialData?.location ?? null as Location | null,
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.date) e.date = 'Data é obrigatória'
    if (form.cost && (isNaN(Number(form.cost)) || Number(form.cost) < 0))
      e.cost = 'Valor inválido'
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
        type: form.type,
        name: form.name.trim(),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        confirmationCode: form.confirmationCode.trim(),
        cost: form.cost ? Number(form.cost) : 0,
        status: form.status,
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
            {initialData ? 'Editar reserva' : 'Nova reserva'}
          </h2>
          <button onClick={onClose} aria-label="Fechar"><X size={20} className="text-muted" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ReservationType }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              >
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ReservationStatus }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Nome / Descrição</label>
            <input
              type="text"
              placeholder="Ex: Voo TAM LA234"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Data</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Início</label>
              <input type="time" value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Fim</label>
              <input type="time" value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Código de confirmação</label>
              <input
                type="text" placeholder="Ex: ABC123"
                value={form.confirmationCode}
                onChange={(e) => setForm((f) => ({ ...f, confirmationCode: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">Valor (R$)</label>
              <input
                type="number" min="0" step="any" placeholder="0,00"
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.cost && <p className="text-xs text-danger mt-1">{errors.cost}</p>}
            </div>
          </div>

          <LocationField value={form.location} onChange={(loc) => setForm((f) => ({ ...f, location: loc }))} />

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Notas (opcional)</label>
            <textarea
              placeholder="Informações adicionais..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none bg-white"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-60"
          >
            {loading ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Adicionar reserva'}
          </button>
        </form>
      </div>
    </div>
  )
}
