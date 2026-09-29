import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TripProvider } from '@/contexts/TripContext'
import { AppLayout } from '@/layouts/AppLayout'
import TripsPage from '@/pages/TripsPage'
import DashboardPage from '@/pages/DashboardPage'
import GastosPage from '@/pages/GastosPage'
import RoteiPage from '@/pages/RoteiPage'
import MalaPage from '@/pages/MalaPage'
import MaisPage from '@/pages/MaisPage'
import ReservasPage from '@/pages/ReservasPage'
import NotasPage from '@/pages/NotasPage'
import BackupPage from '@/pages/BackupPage'
import ConfiguracoesPage from '@/pages/ConfiguracoesPage'
import MapaPage from '@/pages/MapaPage'

export default function App() {
  return (
    <BrowserRouter>
      <TripProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<TripsPage />} />
            <Route path="viagem/:id" element={<DashboardPage />} />
            <Route path="viagem/:id/gastos" element={<GastosPage />} />
            <Route path="viagem/:id/roteiro" element={<RoteiPage />} />
            <Route path="viagem/:id/mala" element={<MalaPage />} />
            <Route path="viagem/:id/mais" element={<MaisPage />} />
            <Route path="viagem/:id/mais/reservas" element={<ReservasPage />} />
            <Route path="viagem/:id/mais/notas" element={<NotasPage />} />
            <Route path="viagem/:id/mais/backup" element={<BackupPage />} />
            <Route path="viagem/:id/mais/configuracoes" element={<ConfiguracoesPage />} />
            <Route path="viagem/:id/mais/mapa" element={<MapaPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </TripProvider>
    </BrowserRouter>
  )
}
