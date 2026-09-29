import { useState, useMemo } from 'react'
import { X, CheckSquare, Square, Luggage } from 'lucide-react'
import type { ChecklistCategory } from '@/types'
import { CHECKLIST_SUGGESTIONS } from '@/data/checklistSuggestions'

const CATEGORY_ORDER: ChecklistCategory[] = [
  'Roupas',
  'Higiene e beleza',
  'Farmácia',
  'Eletrônicos',
  'Documentos',
  'Praia',
  'Acessórios',
  'Outros',
]

const CATEGORY_ICONS: Record<ChecklistCategory, string> = {
  Roupas: '👕',
  'Higiene e beleza': '🧴',
  Farmácia: '💊',
  Eletrônicos: '📱',
  Documentos: '📄',
  Praia: '🏖️',
  Acessórios: '🎒',
  Outros: '📦',
}

interface Props {
  open: boolean
  existingNames: string[]
  onConfirm: (selected: Array<{ name: string; category: ChecklistCategory; quantity: number; weight: number }>) => void
  onClose: () => void
}

export function SuggestedChecklistModal({ open, existingNames, onConfirm, onClose }: Props) {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set())

  const availableSuggestions = useMemo(
    () => CHECKLIST_SUGGESTIONS.filter((s) => !existingNames.includes(s.name)),
    [existingNames],
  )

  const availableByCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<ChecklistCategory, typeof availableSuggestions>>(
        (acc, cat) => {
          acc[cat] = availableSuggestions.filter((s) => s.category === cat)
          return acc
        },
        {} as Record<ChecklistCategory, typeof availableSuggestions>,
      ),
    [availableSuggestions],
  )

  const activeCategories = CATEGORY_ORDER.filter((cat) => availableByCategory[cat]?.length > 0)

  function toggle(name: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function toggleCategory(cat: ChecklistCategory) {
    const catItems = availableByCategory[cat] ?? []
    const allSelected = catItems.every((s) => selectedNames.has(s.name))
    setSelectedNames((prev) => {
      const next = new Set(prev)
      catItems.forEach((s) => {
        if (allSelected) next.delete(s.name)
        else next.add(s.name)
      })
      return next
    })
  }

  function selectAll() {
    setSelectedNames(new Set(availableSuggestions.map((s) => s.name)))
  }

  function clearAll() {
    setSelectedNames(new Set())
  }

  function handleConfirm() {
    const selected = availableSuggestions.filter((s) => selectedNames.has(s.name))
    onConfirm(selected)
    setSelectedNames(new Set())
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Luggage size={20} className="text-primary" />
            <div>
              <h2 className="text-base font-bold text-app-text">Lista sugerida</h2>
              <p className="text-xs text-muted">Selecione os itens que deseja adicionar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-app-text p-1">
            <X size={20} />
          </button>
        </div>

        {/* Select all / clear */}
        <div className="flex gap-3 px-5 py-2.5 border-b border-gray-50">
          <button onClick={selectAll} className="text-xs text-primary font-medium hover:underline">
            Selecionar todos
          </button>
          <span className="text-gray-200">|</span>
          <button onClick={clearAll} className="text-xs text-muted hover:text-app-text hover:underline">
            Limpar seleção
          </button>
          {selectedNames.size > 0 && (
            <span className="ml-auto text-xs font-semibold text-primary">
              {selectedNames.size} selecionado{selectedNames.size !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-5 py-3">
          {activeCategories.length === 0 ? (
            <p className="text-center text-muted text-sm py-8">
              Todos os itens sugeridos já foram adicionados à sua lista.
            </p>
          ) : (
            activeCategories.map((cat) => {
              const catItems = availableByCategory[cat]
              const allSelected = catItems.every((s) => selectedNames.has(s.name))
              const someSelected = !allSelected && catItems.some((s) => selectedNames.has(s.name))
              return (
                <div key={cat} className="mb-5">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-2 w-full text-left mb-2 group"
                  >
                    <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-sm font-semibold text-app-text flex-1">{cat}</span>
                    {allSelected ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : someSelected ? (
                      <CheckSquare size={16} className="text-primary/50" />
                    ) : (
                      <Square size={16} className="text-gray-300 group-hover:text-primary/50" />
                    )}
                  </button>
                  <div className="flex flex-col gap-0.5">
                    {catItems.map((s) => {
                      const checked = selectedNames.has(s.name)
                      return (
                        <button
                          key={s.name}
                          onClick={() => toggle(s.name)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors w-full text-left ${
                            checked
                              ? 'bg-primary-light text-app-text'
                              : 'hover:bg-gray-50 text-app-text'
                          }`}
                        >
                          {checked ? (
                            <CheckSquare size={16} className="text-primary shrink-0" />
                          ) : (
                            <Square size={16} className="text-gray-300 shrink-0" />
                          )}
                          <span className="flex-1">{s.name}</span>
                          {s.quantity > 1 && (
                            <span className="text-xs text-muted">× {s.quantity}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-muted font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedNames.size === 0}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Adicionar {selectedNames.size > 0 ? `(${selectedNames.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
