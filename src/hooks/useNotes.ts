import { useEffect, useState, useCallback } from 'react'
import { noteRepository } from '@/services/storage/noteRepository'
import type { Note } from '@/types'

export function useNotes(tripId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tripId) {
      setNotes([])
      setLoading(false)
      return
    }
    const data = await noteRepository.getAllByTripId(tripId)
    setNotes(data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
    setLoading(false)
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const addNote = useCallback(
    async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
      const now = new Date().toISOString()
      const note: Note = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      await noteRepository.create(note)
      await load()
      return note
    },
    [load],
  )

  const updateNote = useCallback(
    async (id: string, data: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<void> => {
      const existing = await noteRepository.getById(id)
      if (!existing) return
      await noteRepository.update({ ...existing, ...data, updatedAt: new Date().toISOString() })
      await load()
    },
    [load],
  )

  const deleteNote = useCallback(
    async (id: string): Promise<void> => {
      await noteRepository.delete(id)
      await load()
    },
    [load],
  )

  return { notes, addNote, updateNote, deleteNote, loading, refresh: load }
}
