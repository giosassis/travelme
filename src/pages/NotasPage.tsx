import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { useNotes } from '@/hooks/useNotes'
import { NoteCard } from '@/components/note/NoteCard'
import { NoteForm } from '@/components/note/NoteForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import type { Note } from '@/types'

export default function NotasPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { notes, addNote, updateNote, deleteNote, loading } = useNotes(id)

  const [formOpen, setFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setEditingNote(undefined)
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  async function handleSubmit(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editingNote) {
      await updateNote(editingNote.id, data)
    } else {
      await addNote(data)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    await deleteNote(deletingId)
    setDeletingId(null)
  }

  if (!id) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-app-text">Notas</h1>
        <button
          onClick={() => { setEditingNote(undefined); setFormOpen(true) }}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <Plus size={16} />
          Nova nota
        </button>
      </div>

      {loading ? (
        <p className="text-center text-muted py-8 text-sm">Carregando...</p>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma nota ainda"
          description="Use as notas para guardar dicas, lembretes, observações e informações importantes da viagem."
          action={{ label: '+ Nova nota', onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => { setEditingNote(note); setFormOpen(true) }}
              onDelete={() => setDeletingId(note.id)}
            />
          ))}
        </div>
      )}

      {id && (
        <NoteForm
          key={editingNote?.id ?? 'novo'}
          open={formOpen}
          tripId={id}
          initialData={editingNote}
          onSubmit={handleSubmit}
          onClose={() => { setFormOpen(false); setEditingNote(undefined) }}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        title="Excluir nota"
        description="Esta nota será excluída permanentemente."
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
