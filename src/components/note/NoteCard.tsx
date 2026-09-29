import { Pencil, Trash2 } from 'lucide-react'
import type { Note } from '@/types'
import { formatDate } from '@/utils/format'

interface Props {
  note: Note
  onEdit: () => void
  onDelete: () => void
}

export function NoteCard({ note, onEdit, onDelete }: Props) {
  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-app-text">{note.title}</p>
          <p className="text-xs text-muted mt-0.5">{formatDate(note.updatedAt.slice(0, 10))}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit} aria-label="Editar nota" className="p-1.5 text-muted hover:text-primary">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} aria-label="Excluir nota" className="p-1.5 text-muted hover:text-danger">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <p className="text-sm text-muted mt-2 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
    </div>
  )
}
