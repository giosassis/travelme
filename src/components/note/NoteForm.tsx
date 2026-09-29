import { useState } from 'react'
import { X } from 'lucide-react'
import type { Note } from '@/types'

interface Props {
  open: boolean
  tripId: string
  initialData?: Note
  onSubmit: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
}

export function NoteForm({ open, tripId, initialData, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    content: initialData?.content ?? '',
  })
  const [errors, setErrors] = useState<Partial<{ title: string; content: string }>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const e: Partial<{ title: string; content: string }> = {}
    if (!form.title.trim()) e.title = 'Título é obrigatório'
    if (!form.content.trim()) e.content = 'Conteúdo é obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit({ tripId, title: form.title.trim(), content: form.content.trim() })
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
            {initialData ? 'Editar nota' : 'Nova nota'}
          </h2>
          <button onClick={onClose} aria-label="Fechar"><X size={20} className="text-muted" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Título</label>
            <input
              type="text"
              placeholder="Ex: Dicas de restaurantes"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
            />
            {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text mb-1">Conteúdo</label>
            <textarea
              placeholder="Escreva sua nota aqui..."
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none bg-white"
            />
            {errors.content && <p className="text-xs text-danger mt-1">{errors.content}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-60"
          >
            {loading ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Criar nota'}
          </button>
        </form>
      </div>
    </div>
  )
}
