import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, Upload, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTripContext } from '@/contexts/TripContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { exportTripData, importTripData } from '@/utils/backup'
import { tripRepository } from '@/services/storage/tripRepository'
import { expenseRepository } from '@/services/storage/expenseRepository'
import { budgetCategoryRepository } from '@/services/storage/budgetCategoryRepository'
import { itineraryRepository } from '@/services/storage/itineraryRepository'
import { checklistRepository } from '@/services/storage/checklistRepository'
import { reservationRepository } from '@/services/storage/reservationRepository'
import { noteRepository } from '@/services/storage/noteRepository'
import { shoppingRepository } from '@/services/storage/shoppingRepository'
import type { TripBackup } from '@/types'

export default function BackupPage() {
  const { id } = useParams<{ id: string }>()
  const { activeTrip, setActiveTrip, refreshTrips } = useTripContext()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function handleExport() {
    if (!id || !activeTrip) return
    setExporting(true)
    try {
      const [expenses, budgetCategories, itinerary, checklist, reservations, notes, shoppingList] = await Promise.all([
          expenseRepository.getAllByTripId(id),
          budgetCategoryRepository.getAllByTripId(id),
          itineraryRepository.getAllByTripId(id),
          checklistRepository.getAllByTripId(id),
          reservationRepository.getAllByTripId(id),
          noteRepository.getAllByTripId(id),
          shoppingRepository.getAllByTripId(id),
        ])
        const backup: TripBackup = {
          version: 2,
          exportedAt: new Date().toISOString(),
          trip: activeTrip,
          expenses,
          budgetCategories,
          itinerary,
          checklist,
          reservations,
          notes,
          shoppingList,
        }
      exportTripData(backup)
    } finally {
      setExporting(false)
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportError(null)
    setImportSuccess(false)

    const result = await importTripData(file)
    if (!result.ok) {
      setImportError(result.error)
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const { data } = result

    // Generate new IDs to avoid conflicts
    const newTripId = crypto.randomUUID()
    const idMap = new Map<string, string>()
    idMap.set(data.trip.id, newTripId)

    function remapId(oldId: string): string {
      if (!idMap.has(oldId)) idMap.set(oldId, crypto.randomUUID())
      return idMap.get(oldId)!
    }

    const now = new Date().toISOString()
    const newTrip = { ...data.trip, id: newTripId, name: `${data.trip.name} (importado)`, updatedAt: now }

    await tripRepository.create(newTrip)
    await Promise.all([
      ...data.expenses.map((e) => expenseRepository.create({ ...e, id: remapId(e.id), tripId: newTripId })),
      ...data.budgetCategories.map((b) => budgetCategoryRepository.create({ ...b, id: remapId(b.id), tripId: newTripId })),
      ...data.itinerary.map((i) => itineraryRepository.create({ ...i, id: remapId(i.id), tripId: newTripId })),
      ...data.checklist.map((c) => checklistRepository.create({ ...c, id: remapId(c.id), tripId: newTripId })),
      ...data.reservations.map((r) => reservationRepository.create({ ...r, id: remapId(r.id), tripId: newTripId })),
      ...data.notes.map((n) => noteRepository.create({ ...n, id: remapId(n.id), tripId: newTripId })),
      ...(data.shoppingList ?? []).map((s) => shoppingRepository.create({ ...s, id: remapId(s.id), tripId: newTripId })),
    ])

    await refreshTrips()
    setActiveTrip(newTrip)
    setImportSuccess(true)
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setTimeout(() => navigate(`/viagem/${newTripId}`), 1500)
  }

  async function handleDeleteAll() {
    if (!id) return
    await expenseRepository.deleteAllByTripId(id)
    await budgetCategoryRepository.deleteAllByTripId(id)
    await itineraryRepository.deleteAllByTripId(id)
    await checklistRepository.deleteAllByTripId(id)
    await reservationRepository.deleteAllByTripId(id)
    await noteRepository.deleteAllByTripId(id)
    await shoppingRepository.deleteAllByTripId(id)
    setDeleteConfirm(false)
  }

  if (!id) return null

  return (
    <div>
      <h1 className="text-xl font-bold text-app-text mb-6">Backup</h1>

      {/* Export */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center">
            <Download size={18} className="text-teal" />
          </div>
          <div>
            <p className="font-semibold text-app-text text-sm">Exportar viagem</p>
            <p className="text-xs text-muted">Baixar todos os dados como arquivo JSON</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || !activeTrip}
          className="w-full bg-teal text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
        >
          {exporting ? 'Exportando...' : '📥 Exportar dados da viagem'}
        </button>
      </div>

      {/* Import */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <Upload size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-app-text text-sm">Importar viagem</p>
            <p className="text-xs text-muted">Restaurar dados de um arquivo JSON exportado</p>
          </div>
        </div>

        {importError && (
          <div className="flex items-start gap-2 p-3 bg-danger/10 rounded-xl mb-3">
            <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-danger">{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="flex items-start gap-2 p-3 bg-success/10 rounded-xl mb-3">
            <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
            <p className="text-sm text-success">Viagem importada com sucesso! Redirecionando...</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
        >
          {importing ? 'Importando...' : '📤 Selecionar arquivo JSON'}
        </button>
        <p className="text-xs text-muted mt-2 text-center">
          A viagem importada será adicionada às suas viagens existentes.
        </p>
      </div>

      {/* Delete all */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center">
            <Trash2 size={18} className="text-danger" />
          </div>
          <div>
            <p className="font-semibold text-app-text text-sm">Apagar todos os dados</p>
            <p className="text-xs text-muted">Remove gastos, roteiro, mala, reservas e notas</p>
          </div>
        </div>
        <button
          onClick={() => setDeleteConfirm(true)}
          className="w-full border-2 border-danger text-danger py-2.5 rounded-xl text-sm font-medium"
        >
          🗑️ Apagar todos os dados da viagem
        </button>
        <p className="text-xs text-muted mt-2 text-center">A viagem em si não será excluída, apenas os dados internos.</p>
      </div>

      <ConfirmDialog
        open={deleteConfirm}
        title="Apagar todos os dados?"
        description="Todos os gastos, atividades do roteiro, itens da mala, reservas e notas desta viagem serão excluídos permanentemente. A viagem em si será mantida. Esta ação não pode ser desfeita."
        confirmLabel="Apagar tudo"
        danger
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  )
}
