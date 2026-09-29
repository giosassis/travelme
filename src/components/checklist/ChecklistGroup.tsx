import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ChecklistItem, ChecklistCategory } from '@/types'
import { ChecklistItemRow } from './ChecklistItemRow'

const CATEGORY_EMOJI: Record<ChecklistCategory, string> = {
  Roupas: '👕',
  'Higiene e beleza': '🧴',
  Farmácia: '💊',
  Eletrônicos: '📱',
  Documentos: '📄',
  Praia: '🏖️',
  Acessórios: '👜',
  Outros: '📦',
}

interface Props {
  category: ChecklistCategory
  items: ChecklistItem[]
  onToggle: (id: string) => void
  onEdit: (item: ChecklistItem) => void
  onDelete: (id: string) => void
}

export function ChecklistGroup({ category, items, onToggle, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(true)
  const emoji = CATEGORY_EMOJI[category]
  const checkedCount = items.filter((i) => i.checked).length

  return (
    <div className="bg-surface rounded-2xl shadow-sm mb-3 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="font-semibold text-sm text-app-text">{category}</span>
          <span className="text-xs text-muted">
            {checkedCount}/{items.length}
          </span>
        </div>
        {open ? (
          <ChevronDown size={16} className="text-muted" />
        ) : (
          <ChevronRight size={16} className="text-muted" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-3 divide-y divide-gray-50">
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggle(item.id)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
