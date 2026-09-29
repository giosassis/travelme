import { useState } from 'react'
import { X } from 'lucide-react'
import type { Trip } from '@/types'

interface TripFormData {
  name: string
  destination: string
  startDate: string
  endDate: string
  budget: string
  description: string
  luggageWeightLimit: string
}

interface Props {
  open: boolean
  initialData?: Trip
  onSubmit: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
}

const emptyForm: TripFormData = {
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: '',
  description: '',
  luggageWeightLimit: '10',
}

export function TripForm({ open, initialData, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<TripFormData>(
    initialData
      ? {
          name: initialData.name,
          destination: initialData.destination,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          budget: String(initialData.budget),
          description: initialData.description,
          luggageWeightLimit: String(initialData.luggageWeightLimit),
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Partial<TripFormData>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Partial<TripFormData> = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.destination.trim()) e.destination = 'Destino é obrigatório'
    if (!form.startDate) e.startDate = 'Data de início é obrigatória'
    if (!form.endDate) e.endDate = 'Data de término é obrigatória'
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'Data de término deve ser após a data de início'
    if (!form.budget || isNaN(Number(form.budget)) || Number(form.budget) < 0)
      e.budget = 'Orçamento deve ser um valor válido maior ou igual a zero'
    const wl = Number(form.luggageWeightLimit)
    if (isNaN(wl) || wl < 0) e.luggageWeightLimit = 'Limite de peso inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        destination: form.destination.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget),
        currency: 'BRL',
        description: form.description.trim(),
        luggageWeightLimit: Number(form.luggageWeightLimit) || 10,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  function field(key: keyof TripFormData) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl md:rounded-2xl p-6 w-full md:max-w-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-app-text">
            {initialData ? 'Editar viagem' : 'Nova viagem'}
          </h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-app-text mb-1">
              Nome da viagem
            </label>
            <input
              type="text"
              placeholder="Ex: João Pessoa 2026"
              {...field('name')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Destino</label>
            <input
              type="text"
              placeholder="Ex: João Pessoa, PB"
              {...field('destination')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.destination && (
              <p className="text-xs text-danger mt-1">{errors.destination}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">
                Data de início
              </label>
              <input
                type="date"
                {...field('startDate')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.startDate && (
                <p className="text-xs text-danger mt-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text mb-1">
                Data de término
              </label>
              <input
                type="date"
                {...field('endDate')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
              />
              {errors.endDate && (
                <p className="text-xs text-danger mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">
              Orçamento total (R$)
            </label>
            <input
              type="number"
              placeholder="Ex: 4256.47"
              min="0"
              step="any"
              {...field('budget')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.budget && <p className="text-xs text-danger mt-1">{errors.budget}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">
              Limite de peso da mala (kg)
            </label>
            <input
              type="number"
              placeholder="10"
              min="0"
              step="any"
              {...field('luggageWeightLimit')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.luggageWeightLimit && (
              <p className="text-xs text-danger mt-1">{errors.luggageWeightLimit}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">
              Descrição (opcional)
            </label>
            <textarea
              placeholder="Anotações sobre a viagem..."
              {...field('description')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium mt-2 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Criar viagem'}
          </button>
        </form>
      </div>
    </div>
  )
}
