import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTripContext } from '@/contexts/TripContext'
import { loadSampleData } from '@/data/sampleData'
import { Info, FlaskConical, MapPin } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { setActiveTrip, refreshTrips } = useTripContext()
  const navigate = useNavigate()
  const [loadingSample, setLoadingSample] = useState(false)
  const [sampleLoaded, setSampleLoaded] = useState(false)

  async function handleLoadSample() {
    setLoadingSample(true)
    try {
      const trip = await loadSampleData()
      await refreshTrips()
      setActiveTrip(trip)
      setSampleLoaded(true)
      setTimeout(() => navigate(`/viagem/${trip.id}`), 1200)
    } finally {
      setLoadingSample(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-app-text mb-6">Configurações</h1>

      {/* About */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <MapPin size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-app-text">TravelMe</p>
            <p className="text-xs text-muted">Versão 1.0.0</p>
          </div>
        </div>
        <p className="text-sm text-muted">
          Sua viagem, organizada do seu jeito. Todos os dados são salvos localmente no seu dispositivo — sem conta, sem servidor, funciona offline.
        </p>
      </div>

      {/* Sample data */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
            <FlaskConical size={18} className="text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-app-text text-sm">Dados de exemplo</p>
            <p className="text-xs text-muted">Explore o app com uma viagem fictícia</p>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl mb-3">
          <Info size={14} className="text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700">
            Isso criará uma nova viagem de exemplo chamada "João Pessoa 2026" com gastos, roteiro, checklist, reservas e notas fictícias. Você poderá excluí-la normalmente depois.
          </p>
        </div>
        {sampleLoaded ? (
          <p className="text-sm text-success text-center font-medium">✓ Viagem de exemplo criada! Redirecionando...</p>
        ) : (
          <button
            onClick={handleLoadSample}
            disabled={loadingSample}
            className="w-full bg-yellow-500 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
          >
            {loadingSample ? 'Criando...' : '🧪 Carregar viagem de exemplo'}
          </button>
        )}
      </div>

      {/* Offline info */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center shrink-0">
            <Info size={18} className="text-teal" />
          </div>
          <div>
            <p className="font-semibold text-app-text text-sm mb-1">Funcionamento offline</p>
            <p className="text-sm text-muted">
              O TravelMe funciona completamente sem internet. Instale o aplicativo no seu celular para uma experiência ainda melhor.
            </p>
            <p className="text-xs text-muted mt-2">
              Todos os dados são armazenados no IndexedDB do seu navegador, localmente no dispositivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
