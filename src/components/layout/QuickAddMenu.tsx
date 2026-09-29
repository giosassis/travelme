import { useNavigate, useParams } from 'react-router-dom'
import { X, DollarSign, Calendar, Luggage, BookOpen, FileText } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export function QuickAddMenu({ open, onClose }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const base = id ? `/viagem/${id}` : ''

  const options = [
    { icon: DollarSign, label: 'Novo gasto', path: `${base}/gastos?novo=1`, disabled: !id },
    { icon: Calendar, label: 'Nova atividade', path: `${base}/roteiro?novo=1`, disabled: !id },
    { icon: Luggage, label: 'Item da mala', path: `${base}/mala?novo=1`, disabled: !id },
    { icon: BookOpen, label: 'Nova reserva', path: `${base}/mais/reservas?novo=1`, disabled: !id },
    { icon: FileText, label: 'Nova nota', path: `${base}/mais/notas?novo=1`, disabled: !id },
  ]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl md:rounded-2xl p-6 w-full md:max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-app-text">Adicionar</h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={20} className="text-muted" />
          </button>
        </div>

        {!id && (
          <p className="text-sm text-muted text-center py-4">
            Selecione uma viagem para adicionar itens.
          </p>
        )}

        {id && (
          <div className="flex flex-col gap-2">
            {options.map((opt) => (
              <button
                key={opt.path}
                disabled={opt.disabled}
                onClick={() => {
                  navigate(opt.path)
                  onClose()
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg transition-colors text-left disabled:opacity-40"
              >
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                  <opt.icon size={18} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-app-text">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
