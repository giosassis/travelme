import { useParams, Link } from 'react-router-dom'
import { BookOpen, FileText, Download, Settings, ArrowRight, Map, ShoppingBag } from 'lucide-react'

export default function MaisPage() {
  const { id } = useParams<{ id: string }>()
  const base = id ? `/viagem/${id}/mais` : ''

  const items = [
    {
      icon: BookOpen,
      label: 'Reservas',
      description: 'Voos, hospedagens, passeios e mais',
      to: `${base}/reservas`,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: ShoppingBag,
      label: 'Lista de compras',
      description: 'O que comprar antes e durante a viagem',
      to: `${base}/compras`,
      color: 'bg-orange-50 text-orange-500',
    },
    {
      icon: Map,
      label: 'Mapa',
      description: 'Visualize os locais salvos na viagem',
      to: `${base}/mapa`,
      color: 'bg-teal-light text-teal',
    },
    {
      icon: FileText,
      label: 'Notas',
      description: 'Dicas, lembretes e observações',
      to: `${base}/notas`,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      icon: Download,
      label: 'Backup',
      description: 'Exportar e importar dados da viagem',
      to: `${base}/backup`,
      color: 'bg-primary-light text-primary',
    },
    {
      icon: Settings,
      label: 'Configurações',
      description: 'Dados de exemplo e preferências',
      to: `${base}/configuracoes`,
      color: 'bg-gray-100 text-gray-500',
    },
  ]

  if (!id) return null

  return (
    <div>
      <h1 className="text-xl font-bold text-app-text mb-6">Mais</h1>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-surface rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-primary border-2 border-transparent transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-app-text">{item.label}</p>
              <p className="text-xs text-muted truncate">{item.description}</p>
            </div>
            <ArrowRight size={16} className="text-muted shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
